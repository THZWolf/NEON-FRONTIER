#include "Agent.hpp"
#include "../core/Logger.hpp"
#include <algorithm>

namespace NeonFrontier {

Agent::Agent(AgentIdentity identity)
    : m_identity(std::move(identity)) {
    m_state.execution = ExecutionState::INITIALIZED;
    m_state.behavior = BehavioralState::IDLE;
    m_state.lastStateChange = GetCurrentTimestampMs();
    m_state.indicators.alertLevel = 0.0f;

    Logger::Instance().Info(
        LogCategory::INITIALIZATION,
        "Agent created: " + m_identity.id + " (" + m_identity.alias + ")",
        "Agent::Agent"
    );
}

AgentState Agent::GetState() const {
    std::lock_guard<std::mutex> lock(m_mutex);
    return m_state;
}

const AgentInternalIndicators& Agent::GetIndicators() const {
    std::lock_guard<std::mutex> lock(m_mutex);
    return m_state.indicators;
}

void Agent::SetBehavioralState(BehavioralState newState, const std::string& reason) {
    std::lock_guard<std::mutex> lock(m_mutex);
    if (m_state.behavior != newState) {
        BehavioralState oldState = m_state.behavior;
        m_state.behavior = newState;
        m_state.lastStateChange = GetCurrentTimestampMs();

        Logger::Instance().Info(
            LogCategory::DECISION,
            "Agent " + m_identity.id + " changed state: " +
            BehavioralStateToString(oldState) + " -> " + BehavioralStateToString(newState) +
            " [Reason: " + reason + "]",
            "Agent::SetBehavioralState"
        );
    }
}

void Agent::SetExecutionState(ExecutionState newState) {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_state.execution = newState;
}

void Agent::UpdateAlertLevel(float delta, const std::string& cause) {
    std::lock_guard<std::mutex> lock(m_mutex);
    float previous = m_state.indicators.alertLevel;
    m_state.indicators.alertLevel = std::clamp(m_state.indicators.alertLevel + delta, 0.0f, 1.0f);

    Logger::Instance().Debug(
        LogCategory::EVENT,
        "Agent " + m_identity.id + " alert updated: " + std::to_string(previous) + " -> " +
        std::to_string(m_state.indicators.alertLevel) + " (" + cause + ")",
        "Agent::UpdateAlertLevel"
    );
}

void Agent::SetAlertLevel(float level) {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_state.indicators.alertLevel = std::clamp(level, 0.0f, 1.0f);
}

void Agent::SetTrust(const AgentId& targetId, float trustValue) {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_state.indicators.trust[targetId] = std::clamp(trustValue, -1.0f, 1.0f);
}

float Agent::GetTrust(const AgentId& targetId) const {
    std::lock_guard<std::mutex> lock(m_mutex);
    auto it = m_state.indicators.trust.find(targetId);
    if (it != m_state.indicators.trust.end()) {
        return it->second;
    }
    return 0.0f; // Neutral baseline
}

void Agent::SetFamiliarity(const std::string& key, float familiarityValue) {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_state.indicators.familiarity[key] = std::clamp(familiarityValue, 0.0f, 1.0f);
}

float Agent::GetFamiliarity(const std::string& key) const {
    std::lock_guard<std::mutex> lock(m_mutex);
    auto it = m_state.indicators.familiarity.find(key);
    if (it != m_state.indicators.familiarity.end()) {
        return it->second;
    }
    return 0.0f;
}

Result<void> Agent::AddGoal(const Goal& goal) {
    std::lock_guard<std::mutex> lock(m_mutex);
    for (const auto& g : m_state.activeGoals) {
        if (g.id == goal.id) {
            return Result<void>::Fail("Goal ID already exists: " + goal.id);
        }
    }
    m_state.activeGoals.push_back(goal);
    // Sort goals by priority descending
    std::sort(m_state.activeGoals.begin(), m_state.activeGoals.end(),
        [](const Goal& a, const Goal& b) { return a.priority > b.priority; });

    Logger::Instance().Info(
        LogCategory::DECISION,
        "Agent " + m_identity.id + " accepted goal: " + goal.name,
        "Agent::AddGoal"
    );
    return Result<void>::Ok();
}

Result<void> Agent::RemoveGoal(const std::string& goalId) {
    std::lock_guard<std::mutex> lock(m_mutex);
    auto it = std::remove_if(m_state.activeGoals.begin(), m_state.activeGoals.end(),
        [&goalId](const Goal& g) { return g.id == goalId; });
    if (it == m_state.activeGoals.end()) {
        return Result<void>::Fail("Goal not found: " + goalId);
    }
    m_state.activeGoals.erase(it, m_state.activeGoals.end());
    return Result<void>::Ok();
}

Result<void> Agent::CompleteGoal(const std::string& goalId) {
    std::lock_guard<std::mutex> lock(m_mutex);
    for (auto& g : m_state.activeGoals) {
        if (g.id == goalId) {
            g.completed = true;
            Logger::Instance().Info(
                LogCategory::DECISION,
                "Agent " + m_identity.id + " completed goal: " + g.name,
                "Agent::CompleteGoal"
            );
            return Result<void>::Ok();
        }
    }
    return Result<void>::Fail("Goal not found: " + goalId);
}

void Agent::RecordExperience(const std::string& experienceSummary) {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_experienceHistory.push_front(experienceSummary);
    if (m_experienceHistory.size() > MAX_EXPERIENCE_HISTORY) {
        m_experienceHistory.pop_back();
    }
    m_state.totalEventsObserved++;
}

std::vector<std::string> Agent::GetRecentExperiences(size_t limit) const {
    std::lock_guard<std::mutex> lock(m_mutex);
    std::vector<std::string> result;
    size_t count = std::min(limit, m_experienceHistory.size());
    for (size_t i = 0; i < count; ++i) {
        result.push_back(m_experienceHistory[i]);
    }
    return result;
}

void Agent::SetPosition(const Vector3& pos) {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_state.position = pos;
}

Vector3 Agent::GetPosition() const {
    std::lock_guard<std::mutex> lock(m_mutex);
    return m_state.position;
}

void Agent::SetCurrentAction(const std::string& actionName) {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_state.currentActionName = actionName;
}

} // namespace NeonFrontier
