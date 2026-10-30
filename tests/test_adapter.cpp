#include "TestFramework.hpp"
#include "../adapters/SimulatedGtaVAdapter.hpp"

using namespace NeonFrontier;

TEST_CASE(GtaVAdapter, DistinguishSimulationFromRealGame) {
    SimulatedGtaVAdapter adapter(true);

    // CRITICAL REQUIREMENT: Simulated adapter MUST NOT claim GAME_CONNECTED
    ASSERT_EQ(adapter.GetStatus(), AdapterStatus::SIMULATION_MODE);
    ASSERT_FALSE(adapter.GetStatus() == AdapterStatus::GAME_CONNECTED);

    // Verify warnings explicitly mention simulation
    auto warnings = adapter.GetCompatibilityWarnings();
    ASSERT_TRUE(warnings.size() >= 2);
    ASSERT_TRUE(warnings[0].find("SIMULATION_MODE") != std::string::npos);
}

TEST_CASE(GtaVAdapter, HandleUnavailableOrDisconnectedAdapter) {
    SimulatedGtaVAdapter adapter(false); // Disconnected

    ASSERT_EQ(adapter.GetStatus(), AdapterStatus::ADAPTER_DISCONNECTED);
    ASSERT_FALSE(adapter.CheckAvailability());

    // Entity query must return failure and not crash
    auto queryRes = adapter.QueryAccessibleEntities();
    ASSERT_FALSE(queryRes.success);
    ASSERT_TRUE(adapter.GetLastErrorMessage().find("disconnected") != std::string::npos);

    // Polling must return failure when disconnected
    auto pollRes = adapter.PollSupportedEvents();
    ASSERT_FALSE(pollRes.success);
}

TEST_CASE(GtaVAdapter, EntityValidationAndInvalidHandles) {
    SimulatedGtaVAdapter adapter(true);

    // Valid simulated handles (populated in constructor: 1001, 1002)
    ASSERT_TRUE(adapter.IsEntityValid(1001));
    ASSERT_TRUE(adapter.IsEntityValid(1002));

    // Invalid or dead handles
    ASSERT_FALSE(adapter.IsEntityValid(-1));
    ASSERT_FALSE(adapter.IsEntityValid(0));
    ASSERT_FALSE(adapter.IsEntityValid(99999)); // Unknown ped

    // Requesting action on invalid entity must fail
    GtaActionRequest badReq;
    badReq.actionName = "TASK_COMBAT_PED";
    badReq.targetEntityHandle = 99999;
    auto actRes = adapter.RequestAction(badReq);
    ASSERT_FALSE(actRes.success);
}
