#ifndef NEON_FRONTIER_AGENTS_AGENT_STATE_HPP
#define NEON_FRONTIER_AGENTS_AGENT_STATE_HPP

#include "../core/Types.hpp"
#include <unordered_map>
#include <vector>
#include <string>

namespace NeonFrontier {

struct Goal {
    std::string id;
    std::string name;
    std::string description;
    float priority = 0.5f;       // 0.0 to 1.0
    bool completed = false;
    Timestamp deadline = 0;      // 0 = indefinite
};

struct AgentInternalIndicators {
    float alertLevel = 0.0f;     // 0.0 (calm) to 1.0 (combat alert)
    std::unordered_map<std::string, float> familiarity; // entity/zone -> [0.0, 1.0]
    std::unordered_map<AgentId, float> trust;           // agent -> [-1.0 (hostile), +1.0 (trusted)]
};

struct AgentState {
    BehavioralState behavior = BehavioralState::IDLE;
    ExecutionState execution = ExecutionState::UNINITIALIZED;
    AgentInternalIndicators indicators;
    std::vector<Goal> activeGoals;
    Vector3 position;
    Vector3 velocity;
    Timestamp lastStateChange = 0;
    uint32_t totalEventsObserved = 0;
    std::string currentActionName = "NONE";
};

} // namespace NeonFrontier

#endif // NEON_FRONTIER_AGENTS_AGENT_STATE_HPP
