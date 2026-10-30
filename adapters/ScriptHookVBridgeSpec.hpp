#ifndef NEON_FRONTIER_ADAPTERS_SCRIPTHOOKV_BRIDGE_SPEC_HPP
#define NEON_FRONTIER_ADAPTERS_SCRIPTHOOKV_BRIDGE_SPEC_HPP

#include "IGtaVAdapter.hpp"

/**
 * ==============================================================================
 * NEON FRONTIER — GTA V ENHANCED NATIVE BRIDGE SPECIFICATION
 * ==============================================================================
 * This specification defines how the C++17 Neon Frontier core communicates
 * with Grand Theft Auto V Enhanced Edition on Windows via ScriptHookV or FiveM.
 *
 * ARCHITECTURAL CONSTRAINTS:
 * 1. GTA V's main simulation runs on its own engine thread (Fiber/Main Script Thread).
 * 2. Neon Frontier's DecisionEngine and MemorySystem run asynchronously or on a dedicated
 *    AI worker thread to avoid stuttering the game's render loop (60+ FPS target).
 * 3. ScriptHookV native calls (e.g. GET_ENTITY_COORDS, TASK_SMART_FLEE_PED) MUST ONLY
 *    be invoked from the ScriptFiber thread registered via scriptRegister(hInstance, ScriptMain).
 * 4. Cross-thread state exchanges use a lock-free or double-buffered Command/Event Queue.
 *
 * VALIDATED GTA V NATIVE HASHES (Enhanced Edition / b3095+):
 * - GET_ENTITY_COORDS:         0x3FEF770D40960D5A
 * - IS_ENTITY_DEAD:            0x5F9532F3B5CC2551
 * - GET_CLOSEST_PED:           0xC33CA33093F42611
 * - TASK_COMBAT_PED:           0xF166E48407BAC484
 * - TASK_SMART_FLEE_PED:       0x94545224A1410495
 * - TASK_GO_TO_COORD_ANY_MEANS:0x5BC448CB78FA3E88
 * - SET_PED_ALERTNESS:         0xDBA71115ED994142
 * ==============================================================================
 */

namespace NeonFrontier {

struct NativeBridgeConfig {
    bool enableScriptFiber = true;
    uint32_t targetGameBuild = 3095;
    uint32_t pollingFrequencyMs = 50; // 20 Hz synchronization
    bool interceptGunfireEvents = true;
    bool interceptPoliceSirens = true;
};

// Interface declaration for when compiled on Windows with GTA V SDK
class IScriptHookVNativeBridge : public IGtaVAdapter {
public:
    virtual bool InitializeBridge(const NativeBridgeConfig& config) = 0;
    virtual void OnScriptFiberTick() = 0;
    virtual void ShutdownBridge() = 0;
};

} // namespace NeonFrontier

#endif // NEON_FRONTIER_ADAPTERS_SCRIPTHOOKV_BRIDGE_SPEC_HPP
