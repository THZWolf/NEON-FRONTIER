#ifndef NEON_FRONTIER_CORE_TYPES_HPP
#define NEON_FRONTIER_CORE_TYPES_HPP

#include <string>
#include <chrono>
#include <cstdint>
#include <optional>
#include <vector>

namespace NeonFrontier {

// Millisecond-precision simulation timestamp
using Timestamp = uint64_t;
using EntityId = std::string;
using AgentId = std::string;
using EventId = std::string;
using MemoryId = std::string;

// 3D Vector for spatial coordinates in game/simulation world
struct Vector3 {
    float x = 0.0f;
    float y = 0.0f;
    float z = 0.0f;

    bool operator==(const Vector3& other) const {
        return x == other.x && y == other.y && z == other.z;
    }
};

// Internal behavioral state of an agent (distinct from GTA V Ped state)
enum class BehavioralState {
    IDLE,
    PATROLLING,
    INVESTIGATING,
    ALERT,
    ENGAGING,
    FLEEING,
    CONVERSING,
    PLANNING,
    RECOVERING
};

// Execution state of the agent lifecycle
enum class ExecutionState {
    UNINITIALIZED,
    INITIALIZED,
    RUNNING,
    PAUSED,
    TERMINATED,
    ERROR_STATE
};

// Confidence and origin tag for events
enum class EventOrigin {
    CONFIRMED,       // Direct perception / verified ground truth
    UNKNOWN,         // Unverified origin
    INFERRED,        // Derived through agent correlation
    SIMULATED_TEST   // Explicitly generated for automated testing / demonstration
};

// GTA V Adapter status enumeration
enum class AdapterStatus {
    CORE_READY,
    ADAPTER_DISCONNECTED,
    SIMULATION_MODE,
    GAME_CONNECTED,   // ONLY permitted when validated real native bridge is active
    ERROR
};

// Standard result wrapper with error diagnostics
template<typename T>
struct Result {
    bool success;
    std::optional<T> value;
    std::string errorMessage;

    static Result<T> Ok(T val) {
        return { true, std::move(val), "" };
    }

    static Result<T> Fail(std::string error) {
        return { false, std::nullopt, std::move(error) };
    }
};

// Void specialization for Result
template<>
struct Result<void> {
    bool success;
    std::string errorMessage;

    static Result<void> Ok() {
        return { true, "" };
    }

    static Result<void> Fail(std::string error) {
        return { false, std::move(error) };
    }
};

inline Timestamp GetCurrentTimestampMs() {
    using namespace std::chrono;
    return static_cast<Timestamp>(
        duration_cast<milliseconds>(system_clock::now().time_since_epoch()).count()
    );
}

inline const char* BehavioralStateToString(BehavioralState state) {
    switch (state) {
        case BehavioralState::IDLE: return "IDLE";
        case BehavioralState::PATROLLING: return "PATROLLING";
        case BehavioralState::INVESTIGATING: return "INVESTIGATING";
        case BehavioralState::ALERT: return "ALERT";
        case BehavioralState::ENGAGING: return "ENGAGING";
        case BehavioralState::FLEEING: return "FLEEING";
        case BehavioralState::CONVERSING: return "CONVERSING";
        case BehavioralState::PLANNING: return "PLANNING";
        case BehavioralState::RECOVERING: return "RECOVERING";
        default: return "UNKNOWN";
    }
}

inline const char* ExecutionStateToString(ExecutionState state) {
    switch (state) {
        case ExecutionState::UNINITIALIZED: return "UNINITIALIZED";
        case ExecutionState::INITIALIZED: return "INITIALIZED";
        case ExecutionState::RUNNING: return "RUNNING";
        case ExecutionState::PAUSED: return "PAUSED";
        case ExecutionState::TERMINATED: return "TERMINATED";
        case ExecutionState::ERROR_STATE: return "ERROR_STATE";
        default: return "UNKNOWN";
    }
}

inline const char* AdapterStatusToString(AdapterStatus status) {
    switch (status) {
        case AdapterStatus::CORE_READY: return "CORE READY";
        case AdapterStatus::ADAPTER_DISCONNECTED: return "ADAPTER DISCONNECTED";
        case AdapterStatus::SIMULATION_MODE: return "SIMULATION MODE";
        case AdapterStatus::GAME_CONNECTED: return "GAME CONNECTED";
        case AdapterStatus::ERROR: return "ERROR";
        default: return "UNKNOWN";
    }
}

} // namespace NeonFrontier

#endif // NEON_FRONTIER_CORE_TYPES_HPP
