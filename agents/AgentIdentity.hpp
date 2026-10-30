#ifndef NEON_FRONTIER_AGENTS_AGENT_IDENTITY_HPP
#define NEON_FRONTIER_AGENTS_AGENT_IDENTITY_HPP

#include "../core/Types.hpp"
#include <string>
#include <vector>

namespace NeonFrontier {

enum class AgentArchetype {
    OPERATIVE,       // Tactical, disciplined, cautious, high combat readiness
    INFORMANTE,      // Analytical, observant, high social perception, avoids gunfire
    FIXER,           // Pragmatic, risk-calculating, negotiates, resource-focused
    CIVILIAN_WITNESS,// Highly reactive, flees danger, low weapon familiarity
    CUSTOM
};

struct AgentIdentity {
    AgentId id;
    std::string alias;
    AgentArchetype archetype = AgentArchetype::OPERATIVE;
    std::string backgroundBio;
    std::vector<std::string> personalityTraits;
    float baselineAggression = 0.2f;    // 0.0 (pacifist) to 1.0 (hostile)
    float baselineCaution = 0.7f;       // 0.0 (reckless) to 1.0 (hyper-paranoid)
    float baselineSociability = 0.5f;   // 0.0 (lone wolf) to 1.0 (outgoing)
};

inline const char* AgentArchetypeToString(AgentArchetype archetype) {
    switch (archetype) {
        case AgentArchetype::OPERATIVE: return "OPERATIVE";
        case AgentArchetype::INFORMANTE: return "INFORMANTE";
        case AgentArchetype::FIXER: return "FIXER";
        case AgentArchetype::CIVILIAN_WITNESS: return "CIVILIAN_WITNESS";
        case AgentArchetype::CUSTOM: return "CUSTOM";
        default: return "UNKNOWN";
    }
}

} // namespace NeonFrontier

#endif // NEON_FRONTIER_AGENTS_AGENT_IDENTITY_HPP
