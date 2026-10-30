#ifndef NEON_FRONTIER_BEHAVIOR_DECISION_EXPLANATION_HPP
#define NEON_FRONTIER_BEHAVIOR_DECISION_EXPLANATION_HPP

#include "Action.hpp"
#include "../core/Types.hpp"
#include <string>
#include <vector>

namespace NeonFrontier {

struct CandidateEvaluation {
    ActionType actionType;
    std::string actionName;
    float goalAlignmentScore = 0.0f;
    float memoryBiasScore = 0.0f;
    float riskDeterrenceScore = 0.0f;
    float costPenalty = 0.0f;
    float finalUtilityScore = 0.0f;
    std::string evaluationNotes;
};

struct DecisionExplanation {
    AgentId agentId;
    Timestamp timestamp = 0;
    ActionOption selectedAction;
    float finalConfidence = 0.0f;
    std::string primaryDecidingFactor;
    std::string contextualReasoning;
    std::vector<CandidateEvaluation> candidateEvaluations;
    std::vector<MemoryId> memoriesInfluenced;
};

} // namespace NeonFrontier

#endif // NEON_FRONTIER_BEHAVIOR_DECISION_EXPLANATION_HPP
