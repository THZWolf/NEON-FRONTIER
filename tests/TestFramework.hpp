#ifndef NEON_FRONTIER_TESTS_TEST_FRAMEWORK_HPP
#define NEON_FRONTIER_TESTS_TEST_FRAMEWORK_HPP

#include <iostream>
#include <string>
#include <vector>
#include <functional>
#include <sstream>

namespace NeonFrontier::Test {

struct TestCase {
    std::string suiteName;
    std::string testName;
    std::function<void()> func;
};

class TestRegistry {
public:
    static TestRegistry& Instance() {
        static TestRegistry s_reg;
        return s_reg;
    }

    void Register(std::string suite, std::string name, std::function<void()> func) {
        m_tests.push_back({ std::move(suite), std::move(name), std::move(func) });
    }

    int RunAll() {
        int passed = 0;
        int failed = 0;
        std::cout << "=========================================================\n";
        std::cout << "  NEON FRONTIER — C++17 TEST RUNNER EXECUTION\n";
        std::cout << "=========================================================\n";

        for (const auto& test : m_tests) {
            std::cout << "[RUN ] " << test.suiteName << "::" << test.testName << "... ";
            try {
                test.func();
                std::cout << "PASSED\n";
                passed++;
            } catch (const std::exception& e) {
                std::cout << "FAILED: " << e.what() << "\n";
                failed++;
            } catch (...) {
                std::cout << "FAILED: Unknown exception\n";
                failed++;
            }
        }

        std::cout << "=========================================================\n";
        std::cout << "TOTAL: " << m_tests.size() << " | PASSED: " << passed
                  << " | FAILED: " << failed << "\n";
        std::cout << "=========================================================\n";
        return failed == 0 ? 0 : 1;
    }

private:
    std::vector<TestCase> m_tests;
};

#define ASSERT_TRUE(cond) \
    do { \
        if (!(cond)) { \
            std::ostringstream ss; \
            ss << "Assertion failed: " << #cond << " at " << __FILE__ << ":" << __LINE__; \
            throw std::runtime_error(ss.str()); \
        } \
    } while(0)

#define ASSERT_FALSE(cond) ASSERT_TRUE(!(cond))

#define ASSERT_EQ(a, b) \
    do { \
        if (!((a) == (b))) { \
            std::ostringstream ss; \
            ss << "Assertion failed: (" << #a << " == " << #b << ") at " << __FILE__ << ":" << __LINE__; \
            throw std::runtime_error(ss.str()); \
        } \
    } while(0)

#define TEST_CASE(suite, name) \
    void Test_##suite##_##name(); \
    struct Register_##suite##_##name { \
        Register_##suite##_##name() { \
            ::NeonFrontier::Test::TestRegistry::Instance().Register(#suite, #name, Test_##suite##_##name); \
        } \
    } s_register_##suite##_##name; \
    void Test_##suite##_##name()

} // namespace NeonFrontier::Test

#endif // NEON_FRONTIER_TESTS_TEST_FRAMEWORK_HPP
