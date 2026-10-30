#ifndef NEON_FRONTIER_AGENTS_AGENT_HPP
#define NEON_FRONTIER_AGENTS_AGENT_HPP

#include "AgentIdentity.hpp"
#include "AgentState.hpp"
#include <deque>
#include <memory>
#include <mutex>

namespace NeonFrontier {

class Agent {
public:
    explicit Agent(AgentIdentity identity);
    ~Agent() = default;

    const AgentId& GetId() const { return m_identity.id; }
    const AgentIdentity& GetIdentity() const { return m_identity; }
    AgentState GetState() const;
    const AgentInternalIndicators& GetIndicators() const;

    void SetBehavioralState(BehavioralState newState, const std::string& reason);
    void SetExecutionState(ExecutionState newState);
    void UpdateAlertLevel(float delta, const std::string& cause);
    void SetAlertLevel(float level);

    void SetTrust(const AgentId& targetId, float trustValue);
    float GetTrust(const AgentId& targetId) const;

    void SetFamiliarity(const std::string& key, float familiarityValue);
    float GetFamiliarity(const std::string& key) const;

    Result<void> AddGoal(const Goal& goal);
    Result<void> RemoveGoal(const std::string& goalId);
    Result<void> CompleteGoal(const std::string& goalId);

    void RecordExperience(const std::string& experienceSummary);
    std::vector<std::string> GetRecentExperiences(size_t limit = 10) const;

    void SetPosition(const Vector3& pos);
    Vector3 GetPosition() const;

    void SetCurrentAction(const std::string& actionName);

private:
    mutable std::mutex m_mutex;
    AgentIdentity m_identity;
    AgentState m_state;
    std::deque<std::string> m_experienceHistory;
    static constexpr size_t MAX_EXPERIENCE_HISTORY = 100;
};

using AgentPtr = std::shared_ptr<Agent>;

} // namespace NeonFrontier

#endif // NEON_FRONTIER_AGENTS_AGENT_HPP
