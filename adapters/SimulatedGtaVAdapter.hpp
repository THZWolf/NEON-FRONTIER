#ifndef NEON_FRONTIER_ADAPTERS_SIMULATED_GTAV_ADAPTER_HPP
#define NEON_FRONTIER_ADAPTERS_SIMULATED_GTAV_ADAPTER_HPP

#include "IGtaVAdapter.hpp"
#include <unordered_map>
#include <mutex>

namespace NeonFrontier {

class SimulatedGtaVAdapter : public IGtaVAdapter {
public:
    explicit SimulatedGtaVAdapter(bool startConnected = true);
    ~SimulatedGtaVAdapter() override = default;

    bool CheckAvailability() override;
    AdapterStatus GetStatus() const override;
    std::string GetVersionInfo() const override;

    Result<std::vector<GtaEntityDescriptor>> QueryAccessibleEntities(float radius = 200.0f) override;
    Result<std::vector<WorldObservationEvent>> PollSupportedEvents() override;
    Result<void> RequestAction(const GtaActionRequest& request) override;
    bool IsEntityValid(int32_t handle) override;

    std::string GetLastErrorMessage() const override;
    std::vector<std::string> GetCompatibilityWarnings() const override;

    // Test rig controls
    void SetConnected(bool connected);
    void InjectSimulatedEvent(const WorldObservationEvent& event);
    void AddSimulatedEntity(const GtaEntityDescriptor& entity);
    void RemoveSimulatedEntity(int32_t handle);
    void TriggerSimulatedError(const std::string& errorMsg);

private:
    mutable std::mutex m_mutex;
    bool m_connected = false;
    std::string m_lastError;
    std::vector<std::string> m_compatibilityWarnings;
    std::unordered_map<int32_t, GtaEntityDescriptor> m_simulatedEntities;
    std::vector<WorldObservationEvent> m_queuedEvents;
};

} // namespace NeonFrontier

#endif // NEON_FRONTIER_ADAPTERS_SIMULATED_GTAV_ADAPTER_HPP
