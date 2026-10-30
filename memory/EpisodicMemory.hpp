#ifndef NEON_FRONTIER_MEMORY_EPISODIC_MEMORY_HPP
#define NEON_FRONTIER_MEMORY_EPISODIC_MEMORY_HPP

#include "../core/Types.hpp"
#include <string>
#include <vector>
#include <unordered_map>

namespace NeonFrontier {

enum class EventType {
    GUNFIRE_DETECTED,
    POLICE_SIREN_HEARD,
    ENTITY_ENCOUNTERED,
    SAFEHOUSE_ENTERED,
    DEAL_OFFERED,
    RESOURCE_OBTAINED,
    SUSPICIOUS_MOVEMENT,
    BETRAYAL_OBSERVED,
    ALLIANCE_FORMED,
    CUSTOM_EVENT
};

struct EpisodicMemory {
    MemoryId id;
    AgentId agentId;                      // Owner of this episodic memory
    EventType eventType;
    Timestamp timestamp;
    Vector3 location;
    std::vector<std::string> participants; // Other entities or agents involved
    float importanceScore = 0.5f;         // [0.0, 1.0] initial significance
    float confidence = 1.0f;              // [0.0, 1.0] reliability of source
    EventOrigin origin = EventOrigin::CONFIRMED;
    std::string summary;
    std::unordered_map<std::string, std::string> attributes;

    // Decay calculation based on elapsed time
    float GetCurrentSignificance(Timestamp currentTimestamp, float decayRatePerHour) const {
        if (currentTimestamp <= timestamp) return importanceScore * confidence;
        double elapsedHours = static_cast<double>(currentTimestamp - timestamp) / (1000.0 * 3600.0);
        double decayFactor = 1.0 / (1.0 + (decayRatePerHour * elapsedHours));
        return static_cast<float>(importanceScore * confidence * decayFactor);
    }
};

inline const char* EventTypeToString(EventType type) {
    switch (type) {
        case EventType::GUNFIRE_DETECTED: return "GUNFIRE_DETECTED";
        case EventType::POLICE_SIREN_HEARD: return "POLICE_SIREN_HEARD";
        case EventType::ENTITY_ENCOUNTERED: return "ENTITY_ENCOUNTERED";
        case EventType::SAFEHOUSE_ENTERED: return "SAFEHOUSE_ENTERED";
        case EventType::DEAL_OFFERED: return "DEAL_OFFERED";
        case EventType::RESOURCE_OBTAINED: return "RESOURCE_OBTAINED";
        case EventType::SUSPICIOUS_MOVEMENT: return "SUSPICIOUS_MOVEMENT";
        case EventType::BETRAYAL_OBSERVED: return "BETRAYAL_OBSERVED";
        case EventType::ALLIANCE_FORMED: return "ALLIANCE_FORMED";
        case EventType::CUSTOM_EVENT: return "CUSTOM_EVENT";
        default: return "UNKNOWN";
    }
}

inline const char* EventOriginToString(EventOrigin origin) {
    switch (origin) {
        case EventOrigin::CONFIRMED: return "CONFIRMED";
        case EventOrigin::UNKNOWN: return "UNKNOWN";
        case EventOrigin::INFERRED: return "INFERRED";
        case EventOrigin::SIMULATED_TEST: return "SIMULATED_TEST";
        default: return "UNKNOWN";
    }
}

} // namespace NeonFrontier

#endif // NEON_FRONTIER_MEMORY_EPISODIC_MEMORY_HPP
