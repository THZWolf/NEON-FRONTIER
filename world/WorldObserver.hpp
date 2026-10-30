#ifndef NEON_FRONTIER_WORLD_WORLD_OBSERVER_HPP
#define NEON_FRONTIER_WORLD_WORLD_OBSERVER_HPP

#include "WorldEvent.hpp"
#include "../agents/Agent.hpp"
#include "../memory/MemorySystem.hpp"
#include <vector>
#include <memory>
#include <mutex>

namespace NeonFrontier {

class WorldObserver {
public:
    explicit WorldObserver(MemorySystemPtr memorySystem);
    ~WorldObserver() = default;

    void RegisterAgent(AgentPtr agent);
    void UnregisterAgent(const AgentId& agentId);

    // Dispatches an observed event to all registered agents within perception range
    void PostEvent(const WorldObservationEvent& event, float perceptionRadius = 150.0f);

    std::vector<WorldObservationEvent> GetEventHistory(size_t limit = 50, std::optional<EventOrigin> filterOrigin = std::nullopt) const;
    void ClearHistory();

private:
    MemorySystemPtr m_memorySystem;
    mutable std::mutex m_mutex;
    std::vector<AgentPtr> m_registeredAgents;
    std::vector<WorldObservationEvent> m_eventHistory;
    static constexpr size_t MAX_EVENT_HISTORY = 1000;
};

using WorldObserverPtr = std::shared_ptr<WorldObserver>;

} // namespace NeonFrontier

#endif // NEON_FRONTIER_WORLD_WORLD_OBSERVER_HPP
