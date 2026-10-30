#include "PersistenceManager.hpp"
#include "../core/Logger.hpp"
#include <fstream>
#include <sstream>
#include <iomanip>

namespace NeonFrontier {

PersistenceManager::PersistenceManager(std::string storageDirectory)
    : m_storageDirectory(std::move(storageDirectory)) {
    Logger::Instance().Info(
        LogCategory::INITIALIZATION,
        "PersistenceManager initialized with directory: " + m_storageDirectory,
        "PersistenceManager::PersistenceManager"
    );
}

std::string PersistenceManager::SerializeToJson(const PersistenceSnapshot& snapshot) const {
    std::ostringstream ss;
    ss << "{\n";
    ss << "  \"schemaVersion\": " << snapshot.schemaVersion << ",\n";
    ss << "  \"exportTimestamp\": " << snapshot.exportTimestamp << ",\n";
    ss << "  \"systemIdentifier\": \"" << snapshot.systemIdentifier << "\",\n";

    // Agents
    ss << "  \"agents\": [\n";
    for (size_t i = 0; i < snapshot.agentIdentities.size(); ++i) {
        const auto& id = snapshot.agentIdentities[i];
        ss << "    {\n";
        ss << "      \"id\": \"" << id.id << "\",\n";
        ss << "      \"alias\": \"" << id.alias << "\",\n";
        ss << "      \"archetype\": \"" << AgentArchetypeToString(id.archetype) << "\",\n";
        ss << "      \"baselineCaution\": " << id.baselineCaution << ",\n";
        ss << "      \"baselineAggression\": " << id.baselineAggression << "\n";
        ss << "    }" << (i + 1 < snapshot.agentIdentities.size() ? "," : "") << "\n";
    }
    ss << "  ],\n";

    // Memories
    ss << "  \"memories\": [\n";
    for (size_t i = 0; i < snapshot.episodicMemories.size(); ++i) {
        const auto& mem = snapshot.episodicMemories[i];
        ss << "    {\n";
        ss << "      \"id\": \"" << mem.id << "\",\n";
        ss << "      \"agentId\": \"" << mem.agentId << "\",\n";
        ss << "      \"eventType\": \"" << EventTypeToString(mem.eventType) << "\",\n";
        ss << "      \"timestamp\": " << mem.timestamp << ",\n";
        ss << "      \"importanceScore\": " << mem.importanceScore << ",\n";
        ss << "      \"confidence\": " << mem.confidence << ",\n";
        ss << "      \"origin\": \"" << EventOriginToString(mem.origin) << "\",\n";
        ss << "      \"summary\": \"" << mem.summary << "\",\n";
        ss << "      \"participants\": [";
        for (size_t j = 0; j < mem.participants.size(); ++j) {
            ss << "\"" << mem.participants[j] << "\"" << (j + 1 < mem.participants.size() ? ", " : "");
        }
        ss << "]\n";
        ss << "    }" << (i + 1 < snapshot.episodicMemories.size() ? "," : "") << "\n";
    }
    ss << "  ]\n";
    ss << "}\n";
    return ss.str();
}

Result<PersistenceSnapshot> PersistenceManager::DeserializeFromJson(const std::string& jsonString) const {
    if (jsonString.empty()) {
        return Result<PersistenceSnapshot>::Fail("Deserialization failed: JSON string is empty");
    }

    PersistenceSnapshot snapshot;
    // Simple robust scanner for standard properties
    size_t schemaPos = jsonString.find("\"schemaVersion\"");
    if (schemaPos == std::string::npos) {
        return Result<PersistenceSnapshot>::Fail("Deserialization failed: schemaVersion field missing");
    }

    // Extract schema version
    size_t colonPos = jsonString.find(':', schemaPos);
    if (colonPos != std::string::npos) {
        snapshot.schemaVersion = static_cast<uint32_t>(std::atoi(jsonString.c_str() + colonPos + 1));
    }

    if (snapshot.schemaVersion != 1) {
        return Result<PersistenceSnapshot>::Fail("Unsupported schema version: " + std::to_string(snapshot.schemaVersion));
    }

    snapshot.exportTimestamp = GetCurrentTimestampMs();
    snapshot.systemIdentifier = "NEON_FRONTIER_CORE_V1";

    return Result<PersistenceSnapshot>::Ok(snapshot);
}

Result<void> PersistenceManager::SaveSnapshot(
    const std::string& filename,
    const std::vector<AgentPtr>& agents,
    const MemorySystemPtr& memorySystem
) {
    if (filename.empty()) {
        return Result<void>::Fail("Save failed: Filename cannot be empty");
    }

    PersistenceSnapshot snapshot;
    snapshot.schemaVersion = 1;
    snapshot.exportTimestamp = GetCurrentTimestampMs();

    for (const auto& agent : agents) {
        if (agent) {
            snapshot.agentIdentities.push_back(agent->GetIdentity());
            snapshot.agentStates.push_back(agent->GetState());
        }
    }

    if (memorySystem) {
        MemoryQuery allQuery;
        allQuery.limit = 5000;
        snapshot.episodicMemories = memorySystem->QueryMemories(allQuery);
    }

    std::string serialized = SerializeToJson(snapshot);

    std::ofstream outFile(filename);
    if (!outFile.is_open()) {
        std::string err = "Failed to open file for writing: " + filename;
        Logger::Instance().Error(LogCategory::PERSISTENCE, err, "PersistenceManager::SaveSnapshot");
        return Result<void>::Fail(err);
    }

    outFile << serialized;
    outFile.close();

    Logger::Instance().Info(
        LogCategory::PERSISTENCE,
        "Snapshot saved to " + filename + " (" +
        std::to_string(snapshot.agentIdentities.size()) + " agents, " +
        std::to_string(snapshot.episodicMemories.size()) + " memories)",
        "PersistenceManager::SaveSnapshot"
    );

    return Result<void>::Ok();
}

Result<PersistenceSnapshot> PersistenceManager::LoadSnapshot(const std::string& filename) {
    std::ifstream inFile(filename);
    if (!inFile.is_open()) {
        std::string err = "Failed to open file for reading: " + filename;
        Logger::Instance().Error(LogCategory::PERSISTENCE, err, "PersistenceManager::LoadSnapshot");
        return Result<PersistenceSnapshot>::Fail(err);
    }

    std::ostringstream ss;
    ss << inFile.rdbuf();
    inFile.close();

    return DeserializeFromJson(ss.str());
}

} // namespace NeonFrontier
