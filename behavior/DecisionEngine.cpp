#include "DecisionEngine.hpp"
#include "../core/Logger.hpp"
#include <algorithm>
#include <sstream>

namespace NeonFrontier {

DecisionEngine::DecisionEngine(MemorySystemPtr memorySystem)
    : m_memorySystem(std::move(memorySystem)) {
    Logger::Instance().Info(
        LogCategory::INITIALIZATION,
        "DecisionEngine initialized with deterministic utility model",
        "DecisionEngine::DecisionEngine"
    );
}

void DecisionEngine::SetWeights(float goalWeight, float memoryWeight, float riskWeight, float costWeight) {
    m_goalWeight = goalWeight;
    m_memoryWeight = memoryWeight;
    m_riskWeight = riskWeight;
    m_costWeight = costWeight;
}

float DecisionEngine::CalculateGoalAlignment(const Goal& goal, const ActionOption& action) const {
    if (goal.completed) return 0.0f;

    // Tactical heuristics mapping action to goal
    if (goal.name == "SURVIVE" || goal.name == "ESCAPE_POLICE") {
        if (action.type == ActionType::SEEK_COVER || action.type == ActionType::FLEE_AREA || action.type == ActionType::RELOCATE_TO_SAFEHOUSE) {
            return 1.0f * goal.priority;
        }
    } else if (goal.name == "GATHER_INTEL") {
        if (action.type == ActionType::OBSERVE_AND_REPORT || action.type == ActionType::APPROACH_AND_GREET) {
            return 0.9f * goal.priority;
        }
    } else if (goal.name == "ESTABLISH_CONTACT" || goal.name == "TRADE") {
        if (action.type == ActionType::NEGOTIATE_DEAL || action.type == ActionType::APPROACH_AND_GREET) {
            return 1.0f * goal.priority;
        }
    } else if (goal.name == "PATROL_SECTOR") {
        if (action.type == ActionType::CONTINUE_PATROL || action.type == ActionType::OBSERVE_AND_REPORT) {
            return 0.8f * goal.priority;
        }
    }
    return 0.2f * goal.priority;
}

float DecisionEngine::CalculateMemoryBias(const AgentPtr& agent, const ActionOption& action, std::vector<MemoryId>& influencedMemories) const {
    if (!m_memorySystem) return 0.5f;

    MemoryQuery query;
    query.agentId = agent->GetId();
    query.limit = 10;

    auto recentMemories = m_memorySystem->QueryMemories(query);
    float bias = 0.5f; // Neutral baseline

    for (const auto& mem : recentMemories) {
        // If agent experienced gunfire or police recently, favor defensive options
        if (mem.eventType == EventType::GUNFIRE_DETECTED || mem.eventType == EventType::POLICE_SIREN_HEARD) {
            influencedMemories.push_back(mem.id);
            if (action.type == ActionType::SEEK_COVER || action.type == ActionType::FLEE_AREA || action.type == ActionType::RELOCATE_TO_SAFEHOUSE) {
                bias += 0.25f * mem.importanceScore;
            } else if (action.type == ActionType::APPROACH_AND_GREET || action.type == ActionType::NEGOTIATE_DEAL) {
                bias -= 0.35f * mem.importanceScore; // Strong deterrence to exposing self
            }
        }

        // If action targets an entity with existing trust memory
        if (!action.targetEntityId.empty()) {
            for (const auto& participant : mem.participants) {
                if (participant == action.targetEntityId) {
                    influencedMemories.push_back(mem.id);
                    if (mem.eventType == EventType::BETRAYAL_OBSERVED) {
                        if (action.type == ActionType::NEGOTIATE_DEAL || action.type == ActionType::APPROACH_AND_GREET) {
                            bias -= 0.6f;
                        } else if (action.type == ActionType::TAKE_DEFENSIVE_STANCE) {
                            bias += 0.4f;
                        }
                    } else if (mem.eventType == EventType::ALLIANCE_FORMED || mem.eventType == EventType::DEAL_OFFERED) {
                        if (action.type == ActionType::NEGOTIATE_DEAL || action.type == ActionType::APPROACH_AND_GREET) {
                            bias += 0.4f;
                        }
                    }
                }
            }
        }
    }

    return std::clamp(bias, 0.0f, 1.0f);
}

Result<DecisionExplanation> DecisionEngine::EvaluateAndSelectAction(
    const AgentPtr& agent,
    const WorldContext& context,
    const std::vector<ActionOption>& availableActions
) {
    if (!agent) {
        return Result<DecisionExplanation>::Fail("DecisionEngine: Agent cannot be null");
    }
    if (availableActions.empty()) {
        return Result<DecisionExplanation>::Fail("DecisionEngine: No actions available for evaluation");
    }

    DecisionExplanation explanation;
    explanation.agentId = agent->GetId();
    explanation.timestamp = GetCurrentTimestampMs();

    auto state = agent->GetState();
    auto identity = agent->GetIdentity();

    ActionOption bestAction = availableActions[0];
    float highestUtility = -9999.0f;
    std::string primaryFactor = "BASELINE_EVALUATION";

    for (const auto& action : availableActions) {
        CandidateEvaluation eval;
        eval.actionType = action.type;
        eval.actionName = action.name;

        // 1. Goal Alignment
        float goalScore = 0.0f;
        if (!state.activeGoals.empty()) {
            for (const auto& goal : state.activeGoals) {
                goalScore += CalculateGoalAlignment(goal, action);
            }
            goalScore /= static_cast<float>(state.activeGoals.size());
        } else {
            goalScore = 0.3f; // Default baseline when idle
        }
        eval.goalAlignmentScore = goalScore;

        // 2. Memory Bias
        std::vector<MemoryId> localInfluenced;
        eval.memoryBiasScore = CalculateMemoryBias(agent, action, localInfluenced);
        for (const auto& mid : localInfluenced) {
            if (std::find(explanation.memoriesInfluenced.begin(), explanation.memoriesInfluenced.end(), mid) == explanation.memoriesInfluenced.end()) {
                explanation.memoriesInfluenced.push_back(mid);
            }
        }

        // 3. Risk Deterrence (multiplied by agent's caution trait)
        float riskDeterrence = (1.0f - action.estimatedRisk) * identity.baselineCaution;
        if (context.inCombatArea && (action.type == ActionType::SEEK_COVER || action.type == ActionType::FLEE_AREA)) {
            riskDeterrence += 0.4f; // Survival boost in combat
        }
        eval.riskDeterrenceScore = std::clamp(riskDeterrence, 0.0f, 1.0f);

        // 4. Resource Cost Penalty
        eval.costPenalty = action.resourceCost;

        // 5. Total Deterministic Utility Calculation
        eval.finalUtilityScore = (eval.goalAlignmentScore * m_goalWeight) +
                                 (eval.memoryBiasScore * m_memoryWeight) +
                                 (eval.riskDeterrenceScore * m_riskWeight) -
                                 (eval.costPenalty * m_costWeight);

        std::ostringstream notes;
        notes << "Goal:" << eval.goalAlignmentScore << " Mem:" << eval.memoryBiasScore
              << " Risk:" << eval.riskDeterrenceScore << " Cost:" << eval.costPenalty;
        eval.evaluationNotes = notes.str();

        explanation.candidateEvaluations.push_back(eval);

        if (eval.finalUtilityScore > highestUtility) {
            highestUtility = eval.finalUtilityScore;
            bestAction = action;

            if (eval.riskDeterrenceScore > eval.goalAlignmentScore && eval.riskDeterrenceScore > eval.memoryBiasScore) {
                primaryFactor = "RISK_AVOIDANCE";
            } else if (eval.memoryBiasScore > eval.goalAlignmentScore) {
                primaryFactor = "HISTORICAL_EXPERIENCE_BIAS";
            } else {
                primaryFactor = "GOAL_ALIGNMENT";
            }
        }
    }

    explanation.selectedAction = bestAction;
    explanation.finalConfidence = std::clamp((highestUtility + 1.0f) / 2.0f, 0.1f, 1.0f);
    explanation.primaryDecidingFactor = primaryFactor;

    std::ostringstream reasoning;
    reasoning << "Agent " << agent->GetId() << " selected " << bestAction.name
              << " (Utility: " << highestUtility << ") primarily driven by " << primaryFactor;
    if (context.inCombatArea) reasoning << " while operating in simulated combat zone.";
    explanation.contextualReasoning = reasoning.str();

    agent->SetCurrentAction(bestAction.name);

    Logger::Instance().Info(
        LogCategory::DECISION,
        reasoning.str(),
        "DecisionEngine::EvaluateAndSelectAction"
    );

    return Result<DecisionExplanation>::Ok(explanation);
}

} // namespace NeonFrontier
