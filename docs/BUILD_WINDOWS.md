# Compiling NEON FRONTIER on Windows

This guide explains how to compile the C++17 core and run tests on Windows 10/11 using Visual Studio 2022 or CMake.

## Prerequisites

1. **Visual Studio 2022** (Community, Professional, or Enterprise) with **"Desktop development with C++"** workload selected.
2. **CMake 3.20+** (included with Visual Studio or standalone).
3. (Optional) **ScriptHookV SDK** for building the native GTA V `.asi` plugin.

## Method A: Visual Studio 2022 (Open Folder / CMake)

1. Open Visual Studio 2022.
2. Select **File > Open > Folder...** and choose the repository root folder.
3. Visual Studio will automatically detect `CMakeLists.txt` and configure the project.
4. Select target `x64-Release` or `x64-Debug` from the configuration dropdown.
5. Build all targets via **Build > Build All** (`Ctrl + Shift + B`).
6. Run the tests executable: `neon_frontier_tests.exe`.

## Method B: Command Line (MSVC / PowerShell)

Open **Developer Command Prompt for VS 2022** or **x64 Native Tools Command Prompt**:

```powershell
# Create build directory
mkdir build
cd build

# Generate build files with CMake
cmake -G "Visual Studio 17 2022" -A x64 ..

# Compile the solution in Release mode
cmake --build . --config Release

# Run the test suite
.\Release\neon_frontier_tests.exe
```

Expected output:
```
=========================================================
  NEON FRONTIER — C++17 TEST RUNNER EXECUTION
=========================================================
[RUN ] AgentCore::CreateAndIdentifyAgent... PASSED
[RUN ] AgentCore::IndicatorAlertAndTrust... PASSED
[RUN ] AgentCore::GoalManagementAndDuplicates... PASSED
[RUN ] MemorySystem::RecordAndQueryEvent... PASSED
[RUN ] MemorySystem::RejectInvalidData... PASSED
[RUN ] MemorySystem::ParticipantAssociation... PASSED
[RUN ] DecisionEngine::DeterministicSelection... PASSED
[RUN ] DecisionEngine::MemoryInfluencesDecisions... PASSED
[RUN ] Persistence::RoundTripSaveAndLoad... PASSED
[RUN ] Persistence::RejectCorruptOrEmptyJson... PASSED
[RUN ] GtaVAdapter::DistinguishSimulationFromRealGame... PASSED
[RUN ] GtaVAdapter::HandleUnavailableOrDisconnectedAdapter... PASSED
[RUN ] GtaVAdapter::EntityValidationAndInvalidHandles... PASSED
=========================================================
TOTAL: 13 | PASSED: 13 | FAILED: 0
=========================================================
```
