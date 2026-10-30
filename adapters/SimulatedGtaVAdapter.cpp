#include "SimulatedGtaVAdapter.hpp"
#include "../core/Logger.hpp"

namespace NeonFrontier {

SimulatedGtaVAdapter::SimulatedGtaVAdapter(bool startConnected)
    : m_connected(startConnected) {
    m_compatibilityWarnings.push_back(
        "ADAPTER NOTE: Running in SIMULATION_MODE. No real GTA V process or ScriptHookV DLL is attached."
    );
    m_compatibilityWarnings.push_back(
        "Real GTA V Enhanced integration requires native ASI loader with Game Build v3095+ or FiveM native bridge."
    );

    // Populate baseline simulated Los Santos entities
    GtaEntityDescriptor playerPed;
    playerPed.handle = 1001;
    playerPed.entityType = "PED";
    playerPed.position = { 215.3f, -810.2f, 30.5f }; // Legion Square area
    playerPed.isAlive = true;
    playerPed.isPlayer = true;
    m_simulatedEntities[playerPed.handle] = playerPed;

    GtaEntityDescriptor witnessPed;
    witnessPed.handle = 1002;
    witnessPed.entityType = "PED";
    witnessPed.position = { 228.0f, -815.0f, 30.5f };
    witnessPed.isAlive = true;
    witnessPed.isPlayer = false;
    m_simulatedEntities[witnessPed.handle] = witnessPed;

    Logger::Instance().Info(
        LogCategory::COMPATIBILITY,
        "SimulatedGtaVAdapter initialized. Status: " + std::string(AdapterStatusToString(GetStatus())),
        "SimulatedGtaVAdapter::SimulatedGtaVAdapter"
    );
}

bool SimulatedGtaVAdapter::CheckAvailability() {
    std::lock_guard<std::mutex> lock(m_mutex);
    return m_connected;
}

AdapterStatus SimulatedGtaVAdapter::GetStatus() const {
    std::lock_guard<std::mutex> lock(m_mutex);
    if (!m_connected) {
        return AdapterStatus::ADAPTER_DISCONNECTED;
    }
    // NEVER return GAME_CONNECTED for simulated adapter
    return AdapterStatus::SIMULATION_MODE;
}

std::string SimulatedGtaVAdapter::GetVersionInfo() const {
    return "Neon Frontier Simulated GTA V Adapter v1.0.0-mock [STANDALONE TEST RIG]";
}

Result<std::vector<GtaEntityDescriptor>> SimulatedGtaVAdapter::QueryAccessibleEntities(float /*radius*/) {
    std::lock_guard<std::mutex> lock(m_mutex);
    if (!m_connected) {
        m_lastError = "Cannot query entities: Adapter is disconnected";
        return Result<std::vector<GtaEntityDescriptor>>::Fail(m_lastError);
    }

    std::vector<GtaEntityDescriptor> entities;
    entities.reserve(m_simulatedEntities.size());
    for (const auto& pair : m_simulatedEntities) {
        entities.push_back(pair.second);
    }
    return Result<std::vector<GtaEntityDescriptor>>::Ok(entities);
}

Result<std::vector<WorldObservationEvent>> SimulatedGtaVAdapter::PollSupportedEvents() {
    std::lock_guard<std::mutex> lock(m_mutex);
    if (!m_connected) {
        m_lastError = "Cannot poll events: Adapter is disconnected";
        return Result<std::vector<WorldObservationEvent>>::Fail(m_lastError);
    }

    std::vector<WorldObservationEvent> events = std::move(m_queuedEvents);
    m_queuedEvents.clear();
    return Result<std::vector<WorldObservationEvent>>::Ok(events);
}

Result<void> SimulatedGtaVAdapter::RequestAction(const GtaActionRequest& request) {
    std::lock_guard<std::mutex> lock(m_mutex);
    if (!m_connected) {
        m_lastError = "Cannot request action: Adapter disconnected";
        return Result<void>::Fail(m_lastError);
    }

    if (request.targetEntityHandle > 0 && !IsEntityValid(request.targetEntityHandle)) {
        m_lastError = "Invalid target entity handle: " + std::to_string(request.targetEntityHandle);
        return Result<void>::Fail(m_lastError);
    }

    Logger::Instance().Debug(
        LogCategory::EVENT,
        "[SIMULATED GTA V ACTION] Dispatched " + request.actionName +
        " for handle " + std::to_string(request.targetEntityHandle),
        "SimulatedGtaVAdapter::RequestAction"
    );

    return Result<void>::Ok();
}

bool SimulatedGtaVAdapter::IsEntityValid(int32_t handle) {
    if (handle <= 0) return false;
    auto it = m_simulatedEntities.find(handle);
    return it != m_simulatedEntities.end() && it->second.isAlive;
}

std::string SimulatedGtaVAdapter::GetLastErrorMessage() const {
    std::lock_guard<std::mutex> lock(m_mutex);
    return m_lastError;
}

std::vector<std::string> SimulatedGtaVAdapter::GetCompatibilityWarnings() const {
    std::lock_guard<std::mutex> lock(m_mutex);
    return m_compatibilityWarnings;
}

void SimulatedGtaVAdapter::SetConnected(bool connected) {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_connected = connected;
    Logger::Instance().Info(
        LogCategory::COMPATIBILITY,
        std::string("Simulated adapter connection changed to: ") + (connected ? "CONNECTED" : "DISCONNECTED"),
        "SimulatedGtaVAdapter::SetConnected"
    );
}

void SimulatedGtaVAdapter::InjectSimulatedEvent(const WorldObservationEvent& event) {
    std::lock_guard<std::mutex> lock(m_mutex);
    WorldObservationEvent tagged = event;
    tagged.origin = EventOrigin::SIMULATED_TEST;
    tagged.isSimulatedTestData = true;
    m_queuedEvents.push_back(tagged);
}

void SimulatedGtaVAdapter::AddSimulatedEntity(const GtaEntityDescriptor& entity) {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_simulatedEntities[entity.handle] = entity;
}

void SimulatedGtaVAdapter::RemoveSimulatedEntity(int32_t handle) {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_simulatedEntities.erase(handle);
}

void SimulatedGtaVAdapter::TriggerSimulatedError(const std::string& errorMsg) {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_lastError = errorMsg;
    Logger::Instance().Error(
        LogCategory::ERROR,
        "Simulated adapter error triggered: " + errorMsg,
        "SimulatedGtaVAdapter::TriggerSimulatedError"
    );
}

} // namespace NeonFrontier
