#ifndef NEON_FRONTIER_BEHAVIOR_ACTION_HPP
#define NEON_FRONTIER_BEHAVIOR_ACTION_HPP

#include "../core/Types.hpp"
#include <string>

namespace NeonFrontier {

enum class ActionType {
    SEEK_COVER,
    FLEE_AREA,
    OBSERVE_AND_REPORT,
    APPROACH_AND_GREET,
    NEGOTIATE_DEAL,
    TAKE_DEFENSIVE_STANCE,
    RELOCATE_TO_SAFEHOUSE,
    CONTINUE_PATROL,
    REMAIN_PASSIVE
};

struct ActionOption {
    ActionType type;
    std::string name;
    std::string targetEntityId;
    Vector3 destination;
    float estimatedRisk = 0.0f;     // [0.0 (safe), 1.0 (deadly)]
    float resourceCost = 0.0f;      // [0.0, 1.0] stamina, ammo, or credits
    float tacticalValue = 0.5f;     // Base utility value
};

inline const char* ActionTypeToString(ActionType type) {
    switch (type) {
        case ActionType::SEEK_COVER: return "SEEK_COVER";
        case ActionType::FLEE_AREA: return "FLEE_AREA";
        case ActionType::OBSERVE_AND_REPORT: return "OBSERVE_AND_REPORT";
        case ActionType::APPROACH_AND_GREET: return "APPROACH_AND_GREET";
        case ActionType::NEGOTIATE_DEAL: return "NEGOTIATE_DEAL";
        case ActionType::TAKE_DEFENSIVE_STANCE: return "TAKE_DEFENSIVE_STANCE";
        case ActionType::RELOCATE_TO_SAFEHOUSE: return "RELOCATE_TO_SAFEHOUSE";
        case ActionType::CONTINUE_PATROL: return "CONTINUE_PATROL";
        case ActionType::REMAIN_PASSIVE: return "REMAIN_PASSIVE";
        default: return "UNKNOWN";
    }
}

} // namespace NeonFrontier

#endif // NEON_FRONTIER_BEHAVIOR_ACTION_HPP
