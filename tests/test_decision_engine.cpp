#include "TestFramework.hpp"
#include "../behavior/DecisionEngine.hpp"

using namespace NeonFrontier;

TEST_CASE(DecisionEngine, DeterministicSelection) {
    auto memSystem = std::make_shared<MemorySystem>();
    DecisionEngine engine(memSystem);

    AgentIdentity id;
    id.id = "agent_test_det";
    id.alias = "OperativeA";
    id.baselineCaution = 0.9f;
    auto agent = std::make_shared<Agent>(id);

    Goal g;
    g.id = "g_survive";
    g.name = "SURVIVE";
    g.priority = 1.0f;
    agent->AddGoal(g);

    WorldContext ctx;
    ctx.inCombatArea = true;

    ActionOption actCover;
    actCover.type = ActionType::SEEK_COVER;
    actCover.name = "SEEK_COVER";
    actCover.estimatedRisk = 0.1f;
    actCover.resourceCost = 0.1f;

    ActionOption actGreet;
    actGreet.type = ActionType::APPROACH_AND_GREET;
    actGreet.name = "APPROACH_AND_GREET";
    actGreet.estimatedRisk = 0.8f;
    actGreet.resourceCost = 0.0f;

    std::vector<ActionOption> actions = { actGreet, actCover };

    // Run multiple times to prove 100% reproducibility
    auto res1 = engine.EvaluateAndSelectAction(agent, ctx, actions);
    auto res2 = engine.EvaluateAndSelectAction(agent, ctx, actions);

    ASSERT_TRUE(res1.success);
    ASSERT_TRUE(res2.success);
    ASSERT_EQ(res1.value->selectedAction.name, "SEEK_COVER");
    ASSERT_EQ(res2.value->selectedAction.name, "SEEK_COVER");
    ASSERT_EQ(res1.value->primaryDecidingFactor, res2.value->primaryDecidingFactor);
}

TEST_CASE(DecisionEngine, MemoryInfluencesDecisions) {
    auto memSystem = std::make_shared<MemorySystem>();
    DecisionEngine engine(memSystem);

    AgentIdentity id;
    id.id = "agent_viper_01";
    id.alias = "Viper";
    id.baselineCaution = 0.7f;
    auto agent = std::make_shared<Agent>(id);

    ActionOption actTalk;
    actTalk.type = ActionType::APPROACH_AND_GREET;
    actTalk.name = "TALK_TO_TARGET";
    actTalk.targetEntityId = "suspect_marcone";
    actTalk.estimatedRisk = 0.3f;

    ActionOption actDefend;
    actDefend.type = ActionType::TAKE_DEFENSIVE_STANCE;
    actDefend.name = "DEFENSIVE_STANCE";
    actDefend.targetEntityId = "suspect_marcone";
    actDefend.estimatedRisk = 0.2f;

    std::vector<ActionOption> actions = { actTalk, actDefend };
    WorldContext ctx;

    // 1. Without negative memory: TALK is acceptable
    auto decBefore = engine.EvaluateAndSelectAction(agent, ctx, actions);
    ASSERT_TRUE(decBefore.success);

    // 2. Now record an episodic memory of betrayal by suspect_marcone
    EpisodicMemory betrayalMem;
    betrayalMem.id = "mem_betrayal_99";
    betrayalMem.agentId = "agent_viper_01";
    betrayalMem.eventType = EventType::BETRAYAL_OBSERVED;
    betrayalMem.timestamp = GetCurrentTimestampMs();
    betrayalMem.importanceScore = 1.0f;
    betrayalMem.confidence = 1.0f;
    betrayalMem.participants = { "suspect_marcone" };
    betrayalMem.summary = "Marcone ambushed our squad previously";
    memSystem->RecordMemory(betrayalMem);

    // 3. Re-evaluate: Decision engine MUST shift preference away from talk towards defensive stance
    auto decAfter = engine.EvaluateAndSelectAction(agent, ctx, actions);
    ASSERT_TRUE(decAfter.success);
    ASSERT_EQ(decAfter.value->selectedAction.name, "DEFENSIVE_STANCE");
    ASSERT_TRUE(decAfter.value->memoriesInfluenced.size() > 0);
    ASSERT_EQ(decAfter.value->memoriesInfluenced[0], "mem_betrayal_99");
}
