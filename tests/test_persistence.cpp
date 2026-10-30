#include "TestFramework.hpp"
#include "../persistence/PersistenceManager.hpp"
#include <cstdio>

using namespace NeonFrontier;

TEST_CASE(Persistence, RoundTripSaveAndLoad) {
    auto memSystem = std::make_shared<MemorySystem>();
    PersistenceManager persistence;

    AgentIdentity id;
    id.id = "agent_pers_01";
    id.alias = "OperativePersist";
    id.archetype = AgentArchetype::OPERATIVE;
    auto agent = std::make_shared<Agent>(id);

    EpisodicMemory mem;
    mem.id = "mem_pers_1";
    mem.agentId = "agent_pers_01";
    mem.eventType = EventType::SAFEHOUSE_ENTERED;
    mem.timestamp = 500000;
    mem.importanceScore = 0.8f;
    mem.confidence = 1.0f;
    mem.summary = "Entered subterranean bunker at Cypress Flats";
    memSystem->RecordMemory(mem);

    std::string testFile = "test_snapshot.json";
    std::vector<AgentPtr> agents = { agent };

    auto saveRes = persistence.SaveSnapshot(testFile, agents, memSystem);
    ASSERT_TRUE(saveRes.success);

    auto loadRes = persistence.LoadSnapshot(testFile);
    ASSERT_TRUE(loadRes.success);
    ASSERT_EQ(loadRes.value->schemaVersion, 1);
    ASSERT_EQ(loadRes.value->systemIdentifier, "NEON_FRONTIER_CORE_V1");

    // Clean up temporary test file
    std::remove(testFile.c_str());
}

TEST_CASE(Persistence, RejectCorruptOrEmptyJson) {
    PersistenceManager persistence;

    auto resEmpty = persistence.DeserializeFromJson("");
    ASSERT_FALSE(resEmpty.success);

    auto resCorrupt = persistence.DeserializeFromJson("{ invalid json missing schema }");
    ASSERT_FALSE(resCorrupt.success);
}
