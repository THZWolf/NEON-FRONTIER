# NEON FRONTIER — GTA V Enhanced Integration Guide

## 1. Native Environment & Compatibility Matrix

| Component | Requirement | Notes |
| :--- | :--- | :--- |
| **Game Version** | Grand Theft Auto V Enhanced (PC) | Build v3095 or newer |
| **SDK / Loader** | ScriptHookV SDK or FiveM Server/Client Native Wrapper | Must use verified native hashes |
| **Compiler** | MSVC v143 (Visual Studio 2022) | C++17 or C++20 |
| **Thread Architecture**| Dedicated Async Worker Thread + ScriptFiber Dispatch | Prevents FPS drops on render loop |
| **Output Binary** | `.asi` or `.dll` plugin | Placed into GTA V game root folder |

## 2. Thread Safety & ScriptFiber Execution

GTA V's scripting engine relies on cooperative multitasking ("Fibers"):
- **Rule 1**: NEVER call ScriptHookV native functions (e.g., `PED::SET_PED_ALERTNESS`, `TASK::TASK_COMBAT_PED`) from an external thread. Doing so causes immediate game crash `0xC0000005` (Access Violation).
- **Rule 2**: Neon Frontier's `DecisionEngine` runs on a background worker thread. When a decision selects an action (e.g. `SEEK_COVER`), the request is pushed into a thread-safe `GtaActionRequestQueue`.
- **Rule 3**: On every tick of the registered `ScriptMain` fiber, the queue is drained and dispatched to the game via native invocations:

```cpp
// Example ScriptFiber Tick in ScriptHookV ASI
void ScriptMain() {
    NeonFrontier::NativeBridge bridge;
    bridge.Initialize();

    while (true) {
        // Drain pending actions from Neon Frontier Decision Engine
        bridge.DispatchPendingActionsToGtaV();

        // Poll world state and push to WorldObserver
        bridge.CollectPerceptionTelemetry();

        WAIT(0); // Yield fiber back to GTA V engine
    }
}
```

## 3. Native Hash Map

Neon Frontier maps high-level behavioral requests to validated native hashes:

```cpp
namespace Natives {
    constexpr uint64_t GET_ENTITY_COORDS          = 0x3FEF770D40960D5A;
    constexpr uint64_t IS_ENTITY_DEAD             = 0x5F9532F3B5CC2551;
    constexpr uint64_t GET_CLOSEST_PED            = 0xC33CA33093F42611;
    constexpr uint64_t TASK_COMBAT_PED            = 0xF166E48407BAC484;
    constexpr uint64_t TASK_SMART_FLEE_PED        = 0x94545224A1410495;
    constexpr uint64_t TASK_GO_TO_COORD_ANY_MEANS = 0x5BC448CB78FA3E88;
    constexpr uint64_t SET_PED_ALERTNESS          = 0xDBA71115ED994142;
}
```

## 4. Distinction Between Simulation and Real Integration

1. In development and within the Web Dashboard, the system runs with `SimulatedGtaVAdapter`, explicitly displaying `SIMULATION MODE`.
2. The state `GAME CONNECTED` is strictly reserved for when the native ASI plugin communicates bidirectional heartbeat confirmation with the game's active session.
