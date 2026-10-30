#ifndef NEON_FRONTIER_PERSISTENCE_PERSISTENCE_MANAGER_HPP
#define NEON_FRONTIER_PERSISTENCE_PERSISTENCE_MANAGER_HPP

#include "../core/Types.hpp"
#include "../agents/Agent.hpp"
#include "../memory/MemorySystem.hpp"
#include <string>
#include <vector>
#include <memory>

namespace NeonFrontier {

struct PersistenceSnapshot {
    uint32_t schemaVersion = 1;
    Timestamp exportTimestamp = 0;
    std::string systemIdentifier = "NEON_FRONTIER_CORE_V1";
    std::vector<AgentIdentity> agentIdentities;
    std::vector<AgentState> agentStates;
    std::vector<EpisodicMemory> episodicMemories;
};

class PersistenceManager {
public:
    explicit PersistenceManager(std::string storageDirectory = "./neon_frontier_data");
    ~PersistenceManager() = default;

    Result<void> SaveSnapshot(const std::string& filename,
                             const std::vector<AgentPtr>& agents,
                             const MemorySystemPtr& memorySystem);

    Result<PersistenceSnapshot> LoadSnapshot(const std::string& filename);

    // JSON export / import helpers
    std::string SerializeToJson(const PersistenceSnapshot& snapshot) const;
    Result<PersistenceSnapshot> DeserializeFromJson(const std::string& jsonString) const;

    const std::string& GetStorageDirectory() const { return m_storageDirectory; }

private:
    std::string m_storageDirectory;
};

using PersistenceManagerPtr = std::shared_ptr<PersistenceManager>;

} // namespace NeonFrontier

#endif // NEON_FRONTIER_PERSISTENCE_PERSISTENCE_MANAGER_HPP
