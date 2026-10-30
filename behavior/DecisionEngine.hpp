#ifndef NEON_FRONTIER_BEHAVIOR_DECISION_ENGINE_HPP
#define NEON_FRONTIER_BEHAVIOR_DECISION_ENGINE_HPP

#include "Action.hpp"
#include "DecisionExplanation.hpp"
#include "../agents/Agent.hpp"
#include "../memory/MemorySystem.hpp"
#include <vector>
#include <memory>

namespace NeonFrontier {

struct WorldContext {
    Vector3 agentPosition;
    bool inCombatArea = false;
    bool policeActiveNearby = false;
    std::string nearestIdentifiedEntity;
    float proximityToThreat = 999.0f; // meters
    float ambientThreatLevel = 0.0f;  // 0.0 to 1.0
};

class DecisionEngine {
public:
    explicit DecisionEngine(MemorySystemPtr memorySystem);
    ~DecisionEngine() = default;

    Result<DecisionExplanation> EvaluateAndSelectAction(
        const AgentPtr& agent,
        const WorldContext& context,
        const std::vector<ActionOption>& availableActions
    );

    // Configuration weights for utility computation (fully deterministic)
    void SetWeights(float goalWeight, float memoryWeight, float riskWeight, float costWeight);

private:
    float CalculateGoalAlignment(const Goal& goal, const ActionOption& action) const;
    float CalculateMemoryBias(const AgentPtr& agent, const ActionOption& action, std::vector<MemoryId>& influencedMemories) const;

    MemorySystemPtr m_memorySystem;
    float m_goalWeight = 0.35f;
    float m_memoryWeight = 0.30f;
    float m_riskWeight = 0.25f;
    float m_costWeight = 0.10f;
};

using DecisionEnginePtr = std::shared_ptr<DecisionEngine>;

} // namespace NeonFrontier

#endif // NEON_FRONTIER_BEHAVIOR_DECISION_ENGINE_HPP
