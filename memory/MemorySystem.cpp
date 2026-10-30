#include "MemorySystem.hpp"
#include "../core/Logger.hpp"
#include <algorithm>

namespace NeonFrontier {

MemorySystem::MemorySystem(RuntimeConfig config)
    : m_config(std::move(config)) {
    Logger::Instance().Info(
        LogCategory::INITIALIZATION,
        "MemorySystem initialized (maxPerAgent=" + std::to_string(m_config.maxMemoriesPerAgent) + ")",
        "MemorySystem::MemorySystem"
    );
}

Result<void> MemorySystem::ValidateMemory(const EpisodicMemory& memory) const {
    if (memory.id.empty()) {
        return Result<void>::Fail("Memory validation failed: MemoryId cannot be empty");
    }
    if (memory.agentId.empty()) {
        return Result<void>::Fail("Memory validation failed: AgentId cannot be empty");
    }
    if (memory.importanceScore < 0.0f || memory.importanceScore > 1.0f) {
        return Result<void>::Fail("Memory validation failed: Importance score must be between 0.0 and 1.0");
    }
    if (memory.confidence < 0.0f || memory.confidence > 1.0f) {
        return Result<void>::Fail("Memory validation failed: Confidence must be between 0.0 and 1.0");
    }
    if (memory.timestamp == 0) {
        return Result<void>::Fail("Memory validation failed: Timestamp must be greater than zero");
    }
    return Result<void>::Ok();
}

Result<MemoryId> MemorySystem::RecordMemory(const EpisodicMemory& memory) {
    std::lock_guard<std::mutex> lock(m_mutex);

    auto valResult = ValidateMemory(memory);
    if (!valResult.success) {
        Logger::Instance().Warn(
            LogCategory::ERROR,
            valResult.errorMessage,
            "MemorySystem::RecordMemory"
        );
        return Result<MemoryId>::Fail(valResult.errorMessage);
    }

    if (m_memories.find(memory.id) != m_memories.end()) {
        return Result<MemoryId>::Fail("Memory with ID " + memory.id + " already exists");
    }

    m_memories[memory.id] = memory;
    m_agentIndex[memory.agentId].push_back(memory.id);

    for (const auto& participant : memory.participants) {
        m_participantIndex[participant].push_back(memory.id);
    }

    EnforceCapacityLimits(memory.agentId);

    Logger::Instance().Debug(
        LogCategory::EVENT,
        "Episodic memory stored: [" + memory.id + "] for agent " + memory.agentId +
        " (importance=" + std::to_string(memory.importanceScore) + ")",
        "MemorySystem::RecordMemory"
    );

    return Result<MemoryId>::Ok(memory.id);
}

void MemorySystem::EnforceCapacityLimits(const AgentId& agentId) {
    auto it = m_agentIndex.find(agentId);
    if (it == m_agentIndex.end() || it->second.size() <= m_config.maxMemoriesPerAgent) {
        return;
    }

    auto& idList = it->second;
    Timestamp now = GetCurrentTimestampMs();

    // Sort agent memories by current significance ascending (least significant first)
    std::sort(idList.begin(), idList.end(), [this, now](const MemoryId& a, const MemoryId& b) {
        auto memA = m_memories.find(a);
        auto memB = m_memories.find(b);
        float sigA = (memA != m_memories.end()) ? memA->second.GetCurrentSignificance(now, m_config.memoryDecayRatePerHour) : 0.0f;
        float sigB = (memB != m_memories.end()) ? memB->second.GetCurrentSignificance(now, m_config.memoryDecayRatePerHour) : 0.0f;
        return sigA < sigB;
    });

    size_t toRemoveCount = idList.size() - m_config.maxMemoriesPerAgent;
    for (size_t i = 0; i < toRemoveCount; ++i) {
        MemoryId targetId = idList[i];
        m_memories.erase(targetId);
    }

    idList.erase(idList.begin(), idList.begin() + toRemoveCount);

    Logger::Instance().Info(
        LogCategory::PERSISTENCE,
        "Agent " + agentId + " capacity pruned (" + std::to_string(toRemoveCount) + " memories decayed)",
        "MemorySystem::EnforceCapacityLimits"
    );
}

std::vector<EpisodicMemory> MemorySystem::QueryMemories(const MemoryQuery& query) const {
    std::lock_guard<std::mutex> lock(m_mutex);
    std::vector<EpisodicMemory> results;
    Timestamp now = GetCurrentTimestampMs();

    // If query specifies an agent, use the agent index
    if (query.agentId.has_value()) {
        auto it = m_agentIndex.find(query.agentId.value());
        if (it != m_agentIndex.end()) {
            for (const auto& memId : it->second) {
                auto memIt = m_memories.find(memId);
                if (memIt != m_memories.end()) {
                    if (query.Matches(memIt->second, now, m_config.memoryDecayRatePerHour)) {
                        results.push_back(memIt->second);
                        if (results.size() >= query.limit) break;
                    }
                }
            }
        }
    } else {
        for (const auto& pair : m_memories) {
            if (query.Matches(pair.second, now, m_config.memoryDecayRatePerHour)) {
                results.push_back(pair.second);
                if (results.size() >= query.limit) break;
            }
        }
    }

    // Sort by timestamp descending (most recent first)
    std::sort(results.begin(), results.end(), [](const EpisodicMemory& a, const EpisodicMemory& b) {
        return a.timestamp > b.timestamp;
    });

    return results;
}

std::optional<EpisodicMemory> MemorySystem::GetMemoryById(const MemoryId& id) const {
    std::lock_guard<std::mutex> lock(m_mutex);
    auto it = m_memories.find(id);
    if (it != m_memories.end()) {
        return it->second;
    }
    return std::nullopt;
}

std::vector<EpisodicMemory> MemorySystem::GetInteractionsWith(const AgentId& agentId, const std::string& participantId) const {
    MemoryQuery q;
    q.agentId = agentId;
    q.participant = participantId;
    q.limit = 100;
    return QueryMemories(q);
}

size_t MemorySystem::GetTotalMemoryCount() const {
    std::lock_guard<std::mutex> lock(m_mutex);
    return m_memories.size();
}

size_t MemorySystem::GetMemoryCountForAgent(const AgentId& agentId) const {
    std::lock_guard<std::mutex> lock(m_mutex);
    auto it = m_agentIndex.find(agentId);
    if (it != m_agentIndex.end()) {
        return it->second.size();
    }
    return 0;
}

void MemorySystem::PruneExpiredMemories(Timestamp currentTimestamp) {
    std::lock_guard<std::mutex> lock(m_mutex);
    std::vector<MemoryId> toErase;

    for (const auto& pair : m_memories) {
        float sig = pair.second.GetCurrentSignificance(currentTimestamp, m_config.memoryDecayRatePerHour);
        if (sig < m_config.minImportanceThreshold) {
            toErase.push_back(pair.first);
        }
    }

    for (const auto& id : toErase) {
        m_memories.erase(id);
    }

    // Rebuild indices
    m_agentIndex.clear();
    m_participantIndex.clear();
    for (const auto& pair : m_memories) {
        m_agentIndex[pair.second.agentId].push_back(pair.first);
        for (const auto& p : pair.second.participants) {
            m_participantIndex[p].push_back(pair.first);
        }
    }
}

void MemorySystem::Clear() {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_memories.clear();
    m_agentIndex.clear();
    m_participantIndex.clear();
}

} // namespace NeonFrontier
