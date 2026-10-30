#include "Logger.hpp"
#include <iostream>
#include <sstream>
#include <iomanip>

namespace NeonFrontier {

Logger& Logger::Instance() {
    static Logger s_instance;
    return s_instance;
}

void Logger::Log(LogCategory category, LogLevel level, const std::string& message, const std::string& context) {
    std::lock_guard<std::mutex> lock(m_mutex);

    LogEntry entry;
    entry.timestamp = GetCurrentTimestampMs();
    entry.category = category;
    entry.level = level;
    entry.message = message;
    entry.context = context;

    m_entries.push_back(entry);
    if (m_entries.size() > MAX_LOG_ENTRIES) {
        m_entries.erase(m_entries.begin(), m_entries.begin() + (MAX_LOG_ENTRIES / 10));
    }
}

void Logger::Info(LogCategory category, const std::string& message, const std::string& context) {
    Log(category, LogLevel::INFO_LEVEL, message, context);
}

void Logger::Warn(LogCategory category, const std::string& message, const std::string& context) {
    Log(category, LogLevel::WARNING_LEVEL, message, context);
}

void Logger::Error(LogCategory category, const std::string& message, const std::string& context) {
    Log(category, LogLevel::ERROR_LEVEL, message, context);
}

void Logger::Debug(LogCategory category, const std::string& message, const std::string& context) {
    Log(category, LogLevel::DEBUG_LEVEL, message, context);
}

std::vector<LogEntry> Logger::GetLogs(std::optional<LogCategory> category, size_t limit) const {
    std::lock_guard<std::mutex> lock(m_mutex);
    std::vector<LogEntry> filtered;
    filtered.reserve(std::min(limit, m_entries.size()));

    for (auto it = m_entries.rbegin(); it != m_entries.rend() && filtered.size() < limit; ++it) {
        if (!category.has_value() || it->category == category.value()) {
            filtered.push_back(*it);
        }
    }
    return filtered;
}

void Logger::Clear() {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_entries.clear();
}

const char* Logger::CategoryToString(LogCategory cat) {
    switch (cat) {
        case LogCategory::INITIALIZATION: return "INITIALIZATION";
        case LogCategory::COMPATIBILITY: return "COMPATIBILITY";
        case LogCategory::EVENT: return "EVENT";
        case LogCategory::DECISION: return "DECISION";
        case LogCategory::PERSISTENCE: return "PERSISTENCE";
        case LogCategory::ERROR: return "ERROR";
        case LogCategory::PERFORMANCE: return "PERFORMANCE";
        default: return "UNKNOWN";
    }
}

const char* Logger::LevelToString(LogLevel lvl) {
    switch (lvl) {
        case LogLevel::DEBUG_LEVEL: return "DEBUG";
        case LogLevel::INFO_LEVEL: return "INFO";
        case LogLevel::WARNING_LEVEL: return "WARN";
        case LogLevel::ERROR_LEVEL: return "ERROR";
        default: return "LOG";
    }
}

} // namespace NeonFrontier
