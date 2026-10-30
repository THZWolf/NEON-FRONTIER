#include "WorldObserver.hpp"
#include "../core/Logger.hpp"
#include <cmath>

namespace NeonFrontier {

static float CalculateDistance(const Vector3& a, const Vector3& b) {
    float dx = a.x - b.x;
    float dy = a.y - b.y;
    float dz = a.z - b.z;
    return std::sqrt(dx * dx + dy * dy + dz * dz);
}

WorldObserver::WorldObserver(MemorySystemPtr memorySystem)
    : m_memorySystem(std::move(memorySystem)) {
    Logger::Instance().Info(
        LogCategory::INITIALIZATION,
        "WorldObserver initialized",
        "WorldObserver::WorldObserver"
    );
}

void WorldObserver::RegisterAgent(AgentPtr agent) {
    if (!agent) return;
    std::lock_guard<std::mutex> lock(m_mutex);
    for (const auto& a : m_registeredAgents) {
        if (a->GetId() == agent->GetId()) return;
    }
    m_registeredAgents.push_back(agent);
}

void WorldObserver::UnregisterAgent(const AgentId& agentId) {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_registeredAgents.erase(
        std::remove_if(m_registeredAgents.begin(), m_registeredAgents.end(),
            [&agentId](const AgentPtr& a) { return a->GetId() == agentId; }),
        m_registeredAgents.end()
    );
}

void WorldObserver::PostEvent(const WorldObservationEvent& event, float perceptionRadius) {
    std::lock_guard<std::mutex> lock(m_mutex);

    m_eventHistory.push_back(event);
    if (m_eventHistory.size() > MAX_EVENT_HISTORY) {
        m_eventHistory.erase(m_eventHistory.begin());
    }

    std::string originTag = EventOriginDescription(event.origin);
    Logger::Instance().Info(
        LogCategory::EVENT,
        originTag + " " + EventTypeToString(event.type) + ": " + event.description,
        "WorldObserver::PostEvent"
    );

    // Notify agents within range
    for (const auto& agent : m_registeredAgents) {
        float distance = CalculateDistance(agent->GetPosition(), event.position);
        if (distance <= perceptionRadius) {
            // Update agent internal alert indicators
            if (event.type == EventType::GUNFIRE_DETECTED) {
                agent->UpdateAlertLevel(0.4f * event.severity, "Gunfire heard");
                agent->SetBehavioralState(BehavioralState::ALERT, "Audible gunfire in proximity");
            } else if (event.type == EventType::POLICE_SIREN_HEARD) {
                agent->UpdateAlertLevel(0.2f * event.severity, "Siren heard");
            }

            agent->RecordExperience(event.description);

            // Record into episodic memory system for this agent
            if (m_memorySystem) {
                EpisodicMemory mem;
                mem.id = event.id + "_" + agent->GetId();
                mem.agentId = agent->GetId();
                mem.eventType = event.type;
                mem.timestamp = event.timestamp;
                mem.location = event.position;
                mem.participants = event.observedParticipants;
                mem.importanceScore = event.severity;
                mem.confidence = event.confidence;
                mem.origin = event.origin;
                mem.summary = event.description;

                m_memorySystem->RecordMemory(mem);
            }
        }
    }
}

std::vector<WorldObservationEvent> WorldObserver::GetEventHistory(size_t limit, std::optional<EventOrigin> filterOrigin) const {
    std::lock_guard<std::mutex> lock(m_mutex);
    std::vector<WorldObservationEvent> results;

    for (auto it = m_eventHistory.rbegin(); it != m_eventHistory.rend() && results.size() < limit; ++it) {
        if (!filterOrigin.has_value() || it->origin == filterOrigin.value()) {
            results.push_back(*it);
        }
    }
    return results;
}

void WorldObserver::ClearHistory() {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_eventHistory.clear();
}

} // namespace NeonFrontier
