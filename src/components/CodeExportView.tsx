import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, FolderTree, ExternalLink, Download } from 'lucide-react';

export const CodeExportView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('CMakeLists.txt');
  const [copied, setCopied] = useState<boolean>(false);

  const fileCatalog: Record<string, { category: string; description: string; code: string }> = {
    'CMakeLists.txt': {
      category: 'Build System',
      description: 'CMakeLists.txt para compilação C++17 com MSVC (Visual Studio 2022) ou GCC',
      code: `cmake_minimum_required(VERSION 3.16)
project(NeonFrontier LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(neon_frontier_core STATIC
    core/Logger.cpp
    agents/Agent.cpp
    memory/MemorySystem.cpp
    behavior/DecisionEngine.cpp
    world/WorldObserver.cpp
    adapters/SimulatedGtaVAdapter.cpp
    persistence/PersistenceManager.cpp
)

add_executable(neon_frontier_tests
    tests/main_tests.cpp
    tests/test_agent_core.cpp
    tests/test_memory_system.cpp
    tests/test_decision_engine.cpp
    tests/test_persistence.cpp
    tests/test_adapter.cpp
)
target_link_libraries(neon_frontier_tests PRIVATE neon_frontier_core)`,
    },
    'core/Types.hpp': {
      category: 'Core',
      description: 'Definições fundamentais de tipos, estados comportamentais e vetor 3D',
      code: `namespace NeonFrontier {
    using Timestamp = uint64_t;
    using AgentId = std::string;
    using MemoryId = std::string;

    struct Vector3 { float x, y, z; };

    enum class BehavioralState {
        IDLE, PATROLLING, INVESTIGATING, ALERT,
        ENGAGING, FLEEING, CONVERSING, PLANNING, RECOVERING
    };

    enum class AdapterStatus {
        CORE_READY, ADAPTER_DISCONNECTED, SIMULATION_MODE,
        GAME_CONNECTED, ERROR
    };
}`,
    },
    'agents/Agent.hpp': {
      category: 'Agents',
      description: 'Classe de agente com ID estável, objetivos e indicadores internos',
      code: `class Agent {
public:
    explicit Agent(AgentIdentity identity);
    const AgentId& GetId() const;
    AgentState GetState() const;
    void SetBehavioralState(BehavioralState newState, const std::string& reason);
    void UpdateAlertLevel(float delta, const std::string& cause);
    void SetTrust(const AgentId& targetId, float trustValue);
    float GetTrust(const AgentId& targetId) const;
    Result<void> AddGoal(const Goal& goal);
    void RecordExperience(const std::string& experienceSummary);
};`,
    },
    'memory/MemorySystem.hpp': {
      category: 'Memory',
      description: 'Sistema de memória episódica com decaimento temporal e consultas',
      code: `class MemorySystem {
public:
    explicit MemorySystem(RuntimeConfig config = RuntimeConfig{});
    Result<MemoryId> RecordMemory(const EpisodicMemory& memory);
    std::vector<EpisodicMemory> QueryMemories(const MemoryQuery& query) const;
    std::vector<EpisodicMemory> GetInteractionsWith(const AgentId& agentId, const std::string& participantId) const;
    void PruneExpiredMemories(Timestamp currentTimestamp);
};`,
    },
    'behavior/DecisionEngine.cpp': {
      category: 'Behavior',
      description: 'Mecanismo determinístico de utilidade e explainability trace',
      code: `Result<DecisionExplanation> DecisionEngine::EvaluateAndSelectAction(
    const AgentPtr& agent,
    const WorldContext& context,
    const std::vector<ActionOption>& availableActions
) {
    // Utility = (Goal * 0.35) + (MemoryBias * 0.30) + (RiskDeterrence * 0.25) - (Cost * 0.10)
    for (const auto& action : availableActions) {
        float goalScore = CalculateGoalAlignment(action);
        float memoryBias = CalculateMemoryBias(agent, action);
        float riskDeterrence = (1.0f - action.estimatedRisk) * agent->GetIdentity().baselineCaution;
        float utility = (goalScore * 0.35f) + (memoryBias * 0.30f) + (riskDeterrence * 0.25f) - (action.resourceCost * 0.10f);
        // Track candidates and produce transparent reasoning trace
    }
}`,
    },
    'adapters/IGtaVAdapter.hpp': {
      category: 'Adapters',
      description: 'Interface C++ abstrata para conexão ao GTA V Enhanced',
      code: `class IGtaVAdapter {
public:
    virtual ~IGtaVAdapter() = default;
    virtual bool CheckAvailability() = 0;
    virtual AdapterStatus GetStatus() const = 0;
    virtual Result<std::vector<GtaEntityDescriptor>> QueryAccessibleEntities(float radius = 200.0f) = 0;
    virtual Result<std::vector<WorldObservationEvent>> PollSupportedEvents() = 0;
    virtual Result<void> RequestAction(const GtaActionRequest& request) = 0;
    virtual bool IsEntityValid(int32_t handle) = 0;
};`,
    },
    'adapters/ScriptHookVBridgeSpec.hpp': {
      category: 'Adapters',
      description: 'Especificação técnica do native bridge e hashes do GTA V Enhanced',
      code: `/**
 * Validated GTA V Enhanced Hashes (Build v3095+):
 * - GET_ENTITY_COORDS:          0x3FEF770D40960D5A
 * - TASK_COMBAT_PED:            0xF166E48407BAC484
 * - TASK_SMART_FLEE_PED:        0x94545224A1410495
 * - SET_PED_ALERTNESS:          0xDBA71115ED994142
 *
 * Thread Safety: ScriptFiber cooperative loop MUST isolate native calls
 * from Neon Frontier's asynchronous AI background threads.
 */`,
    },
    'docs/BUILD_WINDOWS.md': {
      category: 'Documentation',
      description: 'Guia passo a passo para compilar com Visual Studio 2022',
      code: `# Compilar no Windows (PowerShell / Visual Studio 2022)
mkdir build
cd build
cmake -G "Visual Studio 17 2022" -A x64 ..
cmake --build . --config Release

# Executar testes
.\\Release\\neon_frontier_tests.exe`,
    },
  };

  const currentFile = fileCatalog[selectedFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Overview Banner */}
      <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/40 flex items-center justify-center text-[#00f2fe]">
            <Code2 size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
              NÚCLEO C++17 INDEPENDENTE & EXPORTAÇÃO
            </h3>
            <p className="text-[11px] text-[#718dae]">
              Código C++ modular em <code>core/</code>, <code>agents/</code>, <code>memory/</code>, <code>behavior/</code>, <code>adapters/</code>, <code>tests/</code>
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00f2fe] hover:bg-[#38f5fe] text-black text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,242,254,0.3)] cursor-pointer"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Código Copiado!' : 'Copiar Arquivo'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* File Tree Selector */}
        <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-[#7ea0c7] font-bold border-b border-[#182a40] pb-2">
            <FolderTree size={14} />
            <span>ESTRUTURA C++ DO PROJETO</span>
          </div>

          <div className="space-y-1">
            {Object.entries(fileCatalog).map(([fname, fmeta]) => {
              const isSelected = selectedFile === fname;
              return (
                <button
                  key={fname}
                  onClick={() => setSelectedFile(fname)}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#152e4a] text-[#00f2fe] border border-[#00f2fe]/50 font-bold'
                      : 'text-[#85a2c2] hover:bg-[#0e1828] hover:text-white'
                  }`}
                >
                  <span className="truncate">{fname}</span>
                  <span className="text-[9px] px-1 rounded bg-[#0f1d2e] text-[#5c7a9c]">
                    {fmeta.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Content Preview */}
        <div className="lg:col-span-3 bg-[#070d18] border border-[#18293e] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#152336] pb-2 text-xs">
            <div>
              <b className="text-white text-sm">{selectedFile}</b>
              <p className="text-[10px] text-[#6e8ba8] mt-0.5">{currentFile.description}</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#13273e] text-[#00f2fe]">
              {currentFile.category}
            </span>
          </div>

          <pre className="p-3 bg-[#050912] border border-[#121f30] rounded-xl text-xs text-[#c6ddf7] overflow-x-auto font-mono max-h-[500px]">
            <code>{currentFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
