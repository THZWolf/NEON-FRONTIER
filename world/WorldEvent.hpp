#ifndef NEON_FRONTIER_WORLD_WORLD_EVENT_HPP
#define NEON_FRONTIER_WORLD_WORLD_EVENT_HPP

#include "../core/Types.hpp"
#include "../memory/EpisodicMemory.hpp"
#include <string>
#include <vector>

namespace NeonFrontier {

struct WorldObservationEvent {
    EventId id;
    EventType type;
    Timestamp timestamp;
    Vector3 position;
    std::string sourceEntityId;
    std::vector<std::string> observedParticipants;
    EventOrigin origin; // CONFIRMED, UNKNOWN, INFERRED, SIMULATED_TEST
    float confidence = 1.0f;
    float severity = 0.5f; // [0.0, 1.0]
    std::string description;
    bool isSimulatedTestData = true; // Clear flag: NEVER presents test data as real GTA V telemetry
};

inline const char* EventOriginDescription(EventOrigin origin) {
    switch (origin) {
        case EventOrigin::CONFIRMED: return "[CONFIRMED - Direct Verified Observation]";
        case EventOrigin::UNKNOWN: return "[UNKNOWN - Unverified Observation]";
        case EventOrigin::INFERRED: return "[INFERRED - Agent Deductive Corroboration]";
        case EventOrigin::SIMULATED_TEST: return "[SIMULATED_TEST - Automated Benchmark / Test Rig Data]";
        default: return "[UNCLASSIFIED]";
    }
}

} // namespace NeonFrontier

#endif // NEON_FRONTIER_WORLD_WORLD_EVENT_HPP
