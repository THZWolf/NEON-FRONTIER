cmake_minimum_required(VERSION 3.16)
project(NeonFrontier LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Compiler warnings
if(MSVC)
    add_compile_options(/W4 /EHsc /utf-8)
else()
    add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# Core static library
add_library(neon_frontier_core STATIC
    core/Logger.cpp
    agents/Agent.cpp
    memory/MemorySystem.cpp
    behavior/DecisionEngine.cpp
    world/WorldObserver.cpp
    adapters/SimulatedGtaVAdapter.cpp
    persistence/PersistenceManager.cpp
)

target_include_directories(neon_frontier_core PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}
)

# Test executable
add_executable(neon_frontier_tests
    tests/main_tests.cpp
    tests/test_agent_core.cpp
    tests/test_memory_system.cpp
    tests/test_decision_engine.cpp
    tests/test_persistence.cpp
    tests/test_adapter.cpp
)

target_link_libraries(neon_frontier_tests PRIVATE neon_frontier_core)

# Optional CLI runner
add_executable(neon_frontier_cli
    tests/main_tests.cpp
)
target_link_libraries(neon_frontier_cli PRIVATE neon_frontier_core)
