# NEON FRONTIER — System Architecture

## 1. High-Level Overview

NEON FRONTIER is an autonomous agent behavioral intelligence architecture designed to run alongside complex game engines, specifically tailored for future native integration with **Grand Theft Auto V Enhanced Edition**.

```
+--------------------------------------------------------------------------+
|                        GTA V Enhanced Edition                            |
|             (Graphics, Physics, Animations, Entity World Loop)           |
+--------------------------------------------------------------------------+
                                     ^
                                     | Native Bridge (ScriptHookV / Fiber)
                                     v
+--------------------------------------------------------------------------+
|                          NEON FRONTIER CORE                              |
|                                                                          |
|  +--------------------+   +---------------------+   +-----------------+  |
|  |   World Observer   |-->|   Memory System     |-->| Decision Engine |  |
|  | (Events & Entities)|   | (Episodic & Decay)  |   | (Utility Model) |  |
|  +--------------------+   +---------------------+   +-----------------+  |
|            ^                         ^                       |           |
|            |                         |                       v           |
|  +--------------------+   +---------------------+   +-----------------+  |
|  |   GTA V Adapter    |   | Persistence Manager |   |   Agent Core    |  |
|  |  (Simulated/Native)|   |  (JSON Schema v1)   |   | (State & Goals) |  |
|  +--------------------+   +---------------------+   +-----------------+  |
+--------------------------------------------------------------------------+
                                     ^
                                     | WebSocket / IPC Diagnostics
                                     v
+--------------------------------------------------------------------------+
|                 NEON FRONTIER Web Management Console                     |
|           (React 19, TypeScript, Inspector, Visualizer & Tests)          |
+--------------------------------------------------------------------------+
```

## 2. Core Modules

### 2.1 Agent Core (`agents/`)
- **Identity**: Unique ID, alias, archetype (`OPERATIVE`, `INFORMANTE`, `FIXER`, `CIVILIAN_WITNESS`), baseline personality weights (caution, aggression, sociability).
- **Internal Indicators**: Alert level `[0.0, 1.0]`, dynamic trust matrix with other entities `[-1.0, +1.0]`, and familiarity maps.
- **Goals**: Priority-ordered active objectives (`SURVIVE`, `GATHER_INTEL`, `ESCAPE_POLICE`, `TRADE`).
- **Separation of Concerns**: Indicators are strictly internal to Neon Frontier and do not presume internal GTA V ped flags.

### 2.2 Memory System (`memory/`)
- **Episodic Records**: Timestamp, event type, participants, 3D world location, importance score, and confidence level.
- **Temporal Significance Decay**: Continuous decay curve calculating current importance based on elapsed time:
  $$\text{Significance}(t) = \frac{\text{Importance} \times \text{Confidence}}{1 + \text{DecayRate} \times \Delta t}$$
- **Capacity Enforcement**: Configurable threshold (e.g., 500 memories per agent) with LRU and low-significance pruning.

### 2.3 Decision Engine (`behavior/`)
- **Deterministic Evaluation**: Evaluates candidate actions against weighted factors:
  $$\text{Utility} = (w_g \times \text{GoalAlignment}) + (w_m \times \text{MemoryBias}) + (w_r \times \text{RiskDeterrence}) - (w_c \times \text{ResourceCost})$$
- **Explainability Trace**: Generates transparent decision logs explaining why an action was chosen over competitors, identifying the primary factor (`GOAL_ALIGNMENT`, `HISTORICAL_EXPERIENCE_BIAS`, `RISK_AVOIDANCE`).

### 2.4 World Observer (`world/`)
- Classifies perception data into:
  - `CONFIRMED`: Verified ground truth from adapter.
  - `UNKNOWN`: Unverified telemetry.
  - `INFERRED`: Derived deductions.
  - `SIMULATED_TEST`: Explicitly tagged benchmark and test rig data.

### 2.5 GTA V Adapter (`adapters/`)
- `IGtaVAdapter`: Pure virtual C++ interface providing entity queries, event polling, action requests, and validity checks.
- `SimulatedGtaVAdapter`: Full mock rig for headless benchmarking without GTA V installed.
- `ScriptHookVBridgeSpec`: Documented specification for Windows native ASI compilation.
