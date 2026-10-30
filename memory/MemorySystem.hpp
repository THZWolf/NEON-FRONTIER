#ifndef NEON_FRONTIER_MEMORY_MEMORY_SYSTEM_HPP
#define NEON_FRONTIER_MEMORY_MEMORY_SYSTEM_HPP

#include "EpisodicMemory.hpp"
#include "MemoryQuery.hpp"
#include "../core/Types.hpp"
#include "../core/Config.hpp"
#include <vector>
#include <unordered_map>
#include <mutex>
#include <memory>

namespace NeonFrontier {

class MemorySystem {
public:
    explicit MemorySystem(RuntimeConfig config = RuntimeConfig{});
    ~MemorySystem() = default;

    Result<MemoryId> RecordMemory(const EpisodicMemory& memory);
    std::vector<EpisodicMemory> QueryMemories(const MemoryQuery& query) const;
    std::optional<EpisodicMemory> GetMemoryById(const MemoryId& id) const;

    // Association helper: get all memories where agent interacted with specific entity
    std::vector<EpisodicMemory> GetInteractionsWith(const AgentId& agentId, const std::string& participantId) const;

    size_t GetTotalMemoryCount() const;
    size_t GetMemoryCountForAgent(const AgentId& agentId) const;
    void PruneExpiredMemories(Timestamp currentTimestamp);
    void Clear();

    const RuntimeConfig& GetConfig() const { return m_config; }

private:
    Result<void> ValidateMemory(const EpisodicMemory& memory) const;
    void EnforceCapacityLimits(const AgentId& agentId);

    RuntimeConfig m_config;
    mutable std::mutex m_mutex;

    // Primary storage: MemoryId -> Memory
    std::unordered_map<MemoryId, EpisodicMemory> m_memories;

    // Indices for high-performance lookup
    std::unordered_map<AgentId, std::vector<MemoryId>> m_agentIndex;
    std::unordered_map<std::string, std::vector<MemoryId>> m_participantIndex;
};

using MemorySystemPtr = std::shared_ptr<MemorySystem>;

} // namespace NeonFrontier

#endif // NEON_FRONTIER_MEMORY_MEMORY_SYSTEM_HPP
