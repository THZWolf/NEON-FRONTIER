#include "TestFramework.hpp"
#include "../agents/Agent.hpp"

using namespace NeonFrontier;

TEST_CASE(AgentCore, CreateAndIdentifyAgent) {
    AgentIdentity id;
    id.id = "agent_viper_01";
    id.alias = "Viper";
    id.archetype = AgentArchetype::OPERATIVE;
    id.baselineCaution = 0.8f;
    id.baselineAggression = 0.4f;

    Agent agent(id);

    ASSERT_EQ(agent.GetId(), "agent_viper_01");
    ASSERT_EQ(agent.GetIdentity().alias, "Viper");
    ASSERT_EQ(agent.GetIdentity().archetype, AgentArchetype::OPERATIVE);
    ASSERT_TRUE(agent.GetState().execution == ExecutionState::INITIALIZED);
    ASSERT_TRUE(agent.GetState().behavior == BehavioralState::IDLE);
}

TEST_CASE(AgentCore, IndicatorAlertAndTrust) {
    AgentIdentity id;
    id.id = "agent_cipher_02";
    id.alias = "Cipher";

    Agent agent(id);

    // Initial neutral indicators
    ASSERT_EQ(agent.GetIndicators().alertLevel, 0.0f);
    ASSERT_EQ(agent.GetTrust("agent_target_99"), 0.0f);

    // Update alert and trust
    agent.UpdateAlertLevel(0.5f, "Test Alert Spike");
    ASSERT_EQ(agent.GetIndicators().alertLevel, 0.5f);

    agent.SetTrust("agent_target_99", 0.75f);
    ASSERT_EQ(agent.GetTrust("agent_target_99"), 0.75f);

    // Clamp check
    agent.UpdateAlertLevel(1.5f, "Excessive Spike");
    ASSERT_EQ(agent.GetIndicators().alertLevel, 1.0f);
}

TEST_CASE(AgentCore, GoalManagementAndDuplicates) {
    AgentIdentity id;
    id.id = "agent_jax_03";
    id.alias = "Jax";

    Agent agent(id);

    Goal g1;
    g1.id = "goal_survive_1";
    g1.name = "SURVIVE";
    g1.priority = 0.9f;

    auto res1 = agent.AddGoal(g1);
    ASSERT_TRUE(res1.success);
    ASSERT_EQ(agent.GetState().activeGoals.size(), 1);

    // Attempt duplicate addition
    auto resDuplicate = agent.AddGoal(g1);
    ASSERT_FALSE(resDuplicate.success); // Must reject duplicates
    ASSERT_EQ(agent.GetState().activeGoals.size(), 1);
}
