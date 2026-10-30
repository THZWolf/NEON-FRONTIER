#ifndef NEON_FRONTIER_ADAPTERS_I_GTAV_ADAPTER_HPP
#define NEON_FRONTIER_ADAPTERS_I_GTAV_ADAPTER_HPP

#include "../core/Types.hpp"
#include "../world/WorldEvent.hpp"
#include <vector>
#include <string>
#include <memory>

namespace NeonFrontier {

struct GtaEntityDescriptor {
    int32_t handle = -1;
    std::string entityType; // "PED", "VEHICLE", "OBJECT"
    Vector3 position;
    Vector3 velocity;
    float heading = 0.0f;
    bool isAlive = true;
    bool isPlayer = false;
    uint32_t modelHash = 0;
};

struct GtaActionRequest {
    std::string actionName;
    int32_t targetEntityHandle = -1;
    Vector3 destination;
    float speed = 1.0f;
    std::string parameters;
};

class IGtaVAdapter {
public:
    virtual ~IGtaVAdapter() = default;

    // 1. Integration Availability
    virtual bool CheckAvailability() = 0;
    virtual AdapterStatus GetStatus() const = 0;
    virtual std::string GetVersionInfo() const = 0;

    // 2. Query accessible entities
    virtual Result<std::vector<GtaEntityDescriptor>> QueryAccessibleEntities(float radius = 200.0f) = 0;

    // 3. Receive supported events
    virtual Result<std::vector<WorldObservationEvent>> PollSupportedEvents() = 0;

    // 4. Request allowed actions
    virtual Result<void> RequestAction(const GtaActionRequest& request) = 0;

    // 5. Detect invalid entities
    virtual bool IsEntityValid(int32_t handle) = 0;

    // 6. Diagnostics & Errors
    virtual std::string GetLastErrorMessage() const = 0;
    virtual std::vector<std::string> GetCompatibilityWarnings() const = 0;
};

using GtaVAdapterPtr = std::shared_ptr<IGtaVAdapter>;

} // namespace NeonFrontier

#endif // NEON_FRONTIER_ADAPTERS_I_GTAV_ADAPTER_HPP
