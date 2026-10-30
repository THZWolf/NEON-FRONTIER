import React from 'react';
import { AdapterStatus } from '../types/neon';
import {
  Activity,
  Users,
  Brain,
  Scale,
  Globe,
  Radio,
  CheckCircle2,
  Terminal,
  Code2,
  Lock,
  RotateCcw,
  Save,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  adapterStatus: AdapterStatus;
  adapterConnected: boolean;
  onToggleAdapterConnection: () => void;
  onResetSimulation: () => void;
  onSaveSnapshot: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  adapterStatus,
  adapterConnected,
  onToggleAdapterConnection,
  onResetSimulation,
  onSaveSnapshot,
}) => {
  const getStatusBadge = () => {
    switch (adapterStatus) {
      case 'CORE_READY':
        return {
          label: 'CORE READY',
          classes: 'bg-[#0f3443] border-[#20b2aa] text-[#20b2aa]',
          dot: 'bg-[#20b2aa]',
        };
      case 'SIMULATION_MODE':
        return {
          label: 'SIMULATION MODE',
          classes: 'bg-[#2d220a] border-[#e6a23c] text-[#e6a23c]',
          dot: 'bg-[#e6a23c] animate-pulse',
        };
      case 'ADAPTER_DISCONNECTED':
        return {
          label: 'ADAPTER DISCONNECTED',
          classes: 'bg-[#331111] border-[#f56c6c] text-[#f56c6c]',
          dot: 'bg-[#f56c6c]',
        };
      case 'GAME_CONNECTED':
        return {
          label: 'GAME CONNECTED',
          classes: 'bg-[#0e3a24] border-[#67c23a] text-[#67c23a]',
          dot: 'bg-[#67c23a]',
        };
      case 'ERROR':
      default:
        return {
          label: 'ERROR',
          classes: 'bg-[#400d12] border-[#ff4949] text-[#ff4949]',
          dot: 'bg-[#ff4949]',
        };
    }
  };

  const statusBadge = getStatusBadge();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Geral', icon: Activity },
    { id: 'agents', label: 'Agentes & Indicadores', icon: Users },
    { id: 'memory', label: 'Memória Episódica', icon: Brain },
    { id: 'decision', label: 'Motor de Decisão', icon: Scale },
    { id: 'world', label: 'Observador do Mundo', icon: Globe },
    { id: 'adapter', label: 'Adaptador GTA V', icon: Radio },
    { id: 'tests', label: 'Suíte de Testes (8/8)', icon: CheckCircle2 },
    { id: 'logs', label: 'Diagnóstico & Logs', icon: Terminal },
    { id: 'code', label: 'Código C++ & Export', icon: Code2 },
  ];

  return (
    <header className="border-b border-[#1c2c42] bg-[#09111e]/95 backdrop-blur-md select-none sticky top-0 z-30">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 gap-3 border-b border-[#162335]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f2fe] to-[#4facfe] flex items-center justify-center font-black text-black font-['Chakra_Petch'] text-base shadow-[0_0_12px_rgba(79,172,254,0.4)]">
            NF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-widest text-white font-['Chakra_Petch']">
                NEON <span className="text-[#00f2fe]">FRONTIER</span>
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#102033] border border-[#1f3752] text-[#8fa7c4] font-mono">
                GTA V ENHANCED AI
              </span>
            </div>
            <p className="text-[10px] text-[#7188a3] font-mono leading-none">
              Arquitetura de Agentes Autônomos & Memória Episódica (C++17 / React)
            </p>
          </div>
        </div>

        {/* Global Status Badges & Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Main Status Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold tracking-wider ${statusBadge.classes}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
            <span>{statusBadge.label}</span>
          </div>

          {/* Locked Game Connected Indicator (Explains real state) */}
          <div
            title="GAME CONNECTED requer execução do GTA V Enhanced com ScriptHookV ASI compilado no Windows"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#2a384c] bg-[#0c1624] text-[#60748e] text-[10px] cursor-not-allowed opacity-75"
          >
            <Lock size={11} />
            <span>NATIVE BRIDGE: STANDBY</span>
          </div>

          <button
            onClick={onSaveSnapshot}
            title="Salvar snapshot de memória e agentes"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#112236] hover:bg-[#19324f] border border-[#233f61] text-[#9bc5ed] hover:text-white transition-all cursor-pointer text-xs"
          >
            <Save size={12} />
            <span className="hidden md:inline">Salvar</span>
          </button>

          <button
            onClick={onResetSimulation}
            title="Reiniciar simulação para os dados iniciais"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#112236] hover:bg-[#2e1724] border border-[#233f61] hover:border-[#ff5fa2] text-[#e0a8c2] hover:text-white transition-all cursor-pointer text-xs"
          >
            <RotateCcw size={12} />
            <span className="hidden md:inline">Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 px-3 py-1.5 overflow-x-auto no-scrollbar font-mono text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#152e4a] border border-[#00f2fe]/60 text-[#00f2fe] font-semibold shadow-[0_0_10px_rgba(0,242,254,0.15)]'
                  : 'text-[#8ca3c0] hover:text-white hover:bg-[#112033] border border-transparent'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-[#00f2fe]' : 'text-[#6e85a3]'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
