#ifndef NEON_FRONTIER_MEMORY_MEMORY_QUERY_HPP
#define NEON_FRONTIER_MEMORY_MEMORY_QUERY_HPP

#include "EpisodicMemory.hpp"
#include <optional>
#include <string>

namespace NeonFrontier {

struct MemoryQuery {
    std::optional<AgentId> agentId;
    std::optional<EventType> eventType;
    std::optional<Timestamp> startTime;
    std::optional<Timestamp> endTime;
    std::optional<std::string> participant;
    std::optional<float> minImportance;
    std::optional<EventOrigin> origin;
    size_t limit = 50;

    bool Matches(const EpisodicMemory& memory, Timestamp currentTimestamp = 0, float decayRate = 0.05f) const {
        if (agentId.has_value() && memory.agentId != agentId.value()) return false;
        if (eventType.has_value() && memory.eventType != eventType.value()) return false;
        if (startTime.has_value() && memory.timestamp < startTime.value()) return false;
        if (endTime.has_value() && memory.timestamp > endTime.value()) return false;
        if (origin.has_value() && memory.origin != origin.value()) return false;

        if (participant.has_value()) {
            bool found = false;
            for (const auto& p : memory.participants) {
                if (p == participant.value()) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }

        if (minImportance.has_value()) {
            float significance = (currentTimestamp > 0)
                ? memory.GetCurrentSignificance(currentTimestamp, decayRate)
                : memory.importanceScore;
            if (significance < minImportance.value()) return false;
        }

        return true;
    }
};

} // namespace NeonFrontier

#endif // NEON_FRONTIER_MEMORY_MEMORY_QUERY_HPP
