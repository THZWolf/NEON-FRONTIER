#ifndef NEON_FRONTIER_CORE_CONFIG_HPP
#define NEON_FRONTIER_CORE_CONFIG_HPP

#include <cstddef>
#include <string>

namespace NeonFrontier {

struct RuntimeConfig {
    size_t maxMemoriesPerAgent = 500;
    float memoryDecayRatePerHour = 0.05f;   // 5% decay per hour
    float minImportanceThreshold = 0.15f;   // Minimum importance to store long-term
    bool simulationMode = true;             // True until real GTA V adapter attaches
    std::string persistenceDirectory = "./neon_frontier_data";
    uint32_t schemaVersion = 1;
    uint32_t tickRateHz = 20;               // Decision evaluation rate
    bool verboseLogging = true;
};

} // namespace NeonFrontier

#endif // NEON_FRONTIER_CORE_CONFIG_HPP
