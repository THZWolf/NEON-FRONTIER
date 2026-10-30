#ifndef NEON_FRONTIER_CORE_LOGGER_HPP
#define NEON_FRONTIER_CORE_LOGGER_HPP

#include "Types.hpp"
#include <string>
#include <vector>
#include <mutex>
#include <functional>

namespace NeonFrontier {

enum class LogCategory {
    INITIALIZATION,
    COMPATIBILITY,
    EVENT,
    DECISION,
    PERSISTENCE,
    ERROR,
    PERFORMANCE
};

enum class LogLevel {
    DEBUG_LEVEL,
    INFO_LEVEL,
    WARNING_LEVEL,
    ERROR_LEVEL
};

struct LogEntry {
    Timestamp timestamp;
    LogCategory category;
    LogLevel level;
    std::string message;
    std::string context;
};

class Logger {
public:
    static Logger& Instance();

    void Log(LogCategory category, LogLevel level, const std::string& message, const std::string& context = "");
    void Info(LogCategory category, const std::string& message, const std::string& context = "");
    void Warn(LogCategory category, const std::string& message, const std::string& context = "");
    void Error(LogCategory category, const std::string& message, const std::string& context = "");
    void Debug(LogCategory category, const std::string& message, const std::string& context = "");

    std::vector<LogEntry> GetLogs(std::optional<LogCategory> category = std::nullopt, size_t limit = 100) const;
    void Clear();

    static const char* CategoryToString(LogCategory cat);
    static const char* LevelToString(LogLevel lvl);

private:
    Logger() = default;
    mutable std::mutex m_mutex;
    std::vector<LogEntry> m_entries;
    static constexpr size_t MAX_LOG_ENTRIES = 2000;
};

} // namespace NeonFrontier

#endif // NEON_FRONTIER_CORE_LOGGER_HPP
