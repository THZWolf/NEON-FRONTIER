#include "TestFramework.hpp"
#include "../memory/MemorySystem.hpp"

using namespace NeonFrontier;

TEST_CASE(MemorySystem, RecordAndQueryEvent) {
    RuntimeConfig config;
    MemorySystem memorySystem(config);

    EpisodicMemory mem;
    mem.id = "mem_001";
    mem.agentId = "agent_viper_01";
    mem.eventType = EventType::GUNFIRE_DETECTED;
    mem.timestamp = 1000000;
    mem.importanceScore = 0.9f;
    mem.confidence = 0.95f;
    mem.participants = { "ped_hostile_44" };
    mem.summary = "Gunfire exchanged near Legion Square";

    auto recRes = memorySystem.RecordMemory(mem);
    ASSERT_TRUE(recRes.success);
    ASSERT_EQ(memorySystem.GetTotalMemoryCount(), 1);

    // Query by agent
    MemoryQuery q1;
    q1.agentId = "agent_viper_01";
    auto results1 = memorySystem.QueryMemories(q1);
    ASSERT_EQ(results1.size(), 1);
    ASSERT_EQ(results1[0].id, "mem_001");

    // Query by non-existent agent
    MemoryQuery q2;
    q2.agentId = "agent_nobody";
    auto results2 = memorySystem.QueryMemories(q2);
    ASSERT_EQ(results2.size(), 0);
}

TEST_CASE(MemorySystem, RejectInvalidData) {
    MemorySystem memorySystem;

    // Test 1: Empty Memory ID
    EpisodicMemory invalidId;
    invalidId.id = "";
    invalidId.agentId = "agent_1";
    invalidId.timestamp = 1000;
    ASSERT_FALSE(memorySystem.RecordMemory(invalidId).success);

    // Test 2: Invalid importance score > 1.0
    EpisodicMemory invalidScore;
    invalidScore.id = "mem_err_1";
    invalidScore.agentId = "agent_1";
    invalidScore.timestamp = 1000;
    invalidScore.importanceScore = 1.5f;
    ASSERT_FALSE(memorySystem.RecordMemory(invalidScore).success);

    // Test 3: Zero timestamp
    EpisodicMemory invalidTime;
    invalidTime.id = "mem_err_2";
    invalidTime.agentId = "agent_1";
    invalidTime.timestamp = 0;
    ASSERT_FALSE(memorySystem.RecordMemory(invalidTime).success);
}

TEST_CASE(MemorySystem, ParticipantAssociation) {
    MemorySystem memorySystem;

    EpisodicMemory mem;
    mem.id = "mem_deal_1";
    mem.agentId = "agent_jax_03";
    mem.eventType = EventType::DEAL_OFFERED;
    mem.timestamp = 2000000;
    mem.importanceScore = 0.7f;
    mem.confidence = 1.0f;
    mem.participants = { "contact_frank", "broker_dimitri" };
    mem.summary = "Smuggling deal proposed by Frank";

    memorySystem.RecordMemory(mem);

    auto interactions = memorySystem.GetInteractionsWith("agent_jax_03", "contact_frank");
    ASSERT_EQ(interactions.size(), 1);
    ASSERT_EQ(interactions[0].id, "mem_deal_1");

    auto emptyInteractions = memorySystem.GetInteractionsWith("agent_jax_03", "unknown_person");
    ASSERT_EQ(emptyInteractions.size(), 0);
}
