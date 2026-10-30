import React from 'react';
import { GameState, NPCState } from '../types/game';
import { QUEST_DEFINITIONS } from '../game/constants';
import { Sparkles, Hammer, Car, MessageSquare, Save, RefreshCw, Zap } from 'lucide-react';

interface SidebarProps {
  state: GameState;
  onInteract: () => void;
  onToggleBuild: () => void;
  onToggleVehicle: () => void;
  onCollect: () => void;
  onSave: () => void;
  onNewWorld: () => void;
  onSelectNPC?: (npc: NPCState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  state,
  onInteract,
  onToggleBuild,
  onToggleVehicle,
  onCollect,
  onSave,
  onNewWorld,
  onSelectNPC,
}) => {
  const { player, npcs, log, quest } = state;
  const currentQuest = QUEST_DEFINITIONS[quest] || QUEST_DEFINITIONS[QUEST_DEFINITIONS.length - 1];

  return (
    <aside className="w-full lg:w-[290px] xl:w-[310px] flex flex-col gap-2.5 overflow-y-auto max-h-[42dvh] lg:max-h-full p-0.5 select-none font-mono">
      {/* EXPLORER STATUS */}
      <section className="bg-[#0d1727] border border-[#263b56] rounded-xl p-3 shadow-sm">
        <h2 className="text-[11px] font-bold tracking-widest text-[#66f4e8] uppercase mb-2 flex items-center justify-between">
          <span>STATUS DO EXPLORADOR</span>
          <span className="text-[10px] text-[#8199b5] font-normal">SISTEMA V1.0</span>
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#132138] border border-[#1b2d49] rounded-lg p-2">
            <small className="block text-[#9bb0c9] text-[10px]">Créditos ◈</small>
            <strong className="text-base sm:text-lg font-bold text-[#eaf5ff]">{player.credits}</strong>
          </div>
          <div className="bg-[#132138] border border-[#1b2d49] rounded-lg p-2">
            <small className="block text-[#9bb0c9] text-[10px]">Materiais ▦</small>
            <strong className="text-base sm:text-lg font-bold text-[#66f4e8]">{player.materials}</strong>
          </div>
          <div className="bg-[#132138] border border-[#1b2d49] rounded-lg p-2">
            <small className="block text-[#9bb0c9] text-[10px]">Distritos</small>
            <strong className="text-base sm:text-lg font-bold text-[#ffd166]">{player.discoveries}</strong>
          </div>
          <div className="bg-[#132138] border border-[#1b2d49] rounded-lg p-2">
            <small className="block text-[#9bb0c9] text-[10px]">Distância</small>
            <strong className="text-base sm:text-lg font-bold text-[#eaf5ff]">{player.steps}m</strong>
          </div>
        </div>

        {/* Energy bar */}
        <div className="mt-2.5 pt-2 border-t border-[#1a2c44]">
          <div className="flex items-center justify-between text-[10px] text-[#9bb0c9] mb-1">
            <span className="flex items-center gap-1">
              <Zap size={11} className="text-[#66f4e8]" /> Energia
            </span>
            <span className="font-bold text-[#eaf5ff]">{Math.round(player.energy)}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#1b2b40] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2ab7ca] to-[#66f4e8] transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, player.energy))}%` }}
            />
          </div>
        </div>
      </section>

      {/* CURRENT QUEST */}
      <section className="bg-[#0d1727] border border-[#263b56] rounded-xl p-3 shadow-sm">
        <h2 className="text-[11px] font-bold tracking-widest text-[#66f4e8] uppercase mb-1.5">
          OBJETIVO ATUAL
        </h2>
        <div className="text-xs text-[#c4d4e8] leading-relaxed">
          <b className="text-[#ffffff] block text-xs font-semibold">{currentQuest.title}</b>
          <p className="mt-0.5 text-[11px] text-[#9cb0c8]">{currentQuest.description}</p>
        </div>
      </section>

      {/* TOOLS & ACTIONS */}
      <section className="bg-[#0d1727] border border-[#263b56] rounded-xl p-3 shadow-sm">
        <h2 className="text-[11px] font-bold tracking-widest text-[#66f4e8] uppercase mb-2">
          FERRAMENTAS
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onInteract}
            className="flex items-center justify-center gap-1.5 text-xs py-2 px-1 rounded-lg bg-[#15253b] hover:bg-[#1a4050] border border-[#34506e] hover:border-[#66f4e8] text-[#eaf5ff] transition-all cursor-pointer font-medium"
          >
            <MessageSquare size={13} className="text-[#ff5fa2]" />
            <span>Interagir (E)</span>
          </button>

          <button
            onClick={onToggleBuild}
            className={`flex items-center justify-center gap-1.5 text-xs py-2 px-1 rounded-lg border transition-all cursor-pointer font-medium ${
              player.buildMode
                ? 'bg-[#10474b] border-[#66f4e8] text-[#66f4e8] shadow-[0_0_10px_rgba(102,244,232,0.3)]'
                : 'bg-[#15253b] hover:bg-[#1a4050] border-[#34506e] hover:border-[#66f4e8] text-[#eaf5ff]'
            }`}
          >
            <Hammer size={13} className="text-[#66f4e8]" />
            <span>Construir (B)</span>
          </button>

          <button
            onClick={onToggleVehicle}
            className={`flex items-center justify-center gap-1.5 text-xs py-2 px-1 rounded-lg border transition-all cursor-pointer font-medium ${
              player.inVehicle
                ? 'bg-[#10474b] border-[#66f4e8] text-[#66f4e8] shadow-[0_0_10px_rgba(102,244,232,0.3)]'
                : 'bg-[#15253b] hover:bg-[#1a4050] border-[#34506e] hover:border-[#66f4e8] text-[#eaf5ff]'
            }`}
          >
            <Car size={13} className="text-[#66f4e8]" />
            <span>Veículo (F)</span>
          </button>

          <button
            onClick={onCollect}
            className="flex items-center justify-center gap-1.5 text-xs py-2 px-1 rounded-lg bg-[#15253b] hover:bg-[#1a4050] border border-[#34506e] hover:border-[#ffd166] text-[#eaf5ff] transition-all cursor-pointer font-medium"
          >
            <Sparkles size={13} className="text-[#ffd166]" />
            <span>Coletar (Q)</span>
          </button>

          <button
            onClick={onSave}
            className="flex items-center justify-center gap-1.5 text-xs py-2 px-1 rounded-lg bg-[#15253b] hover:bg-[#1a4050] border border-[#34506e] hover:border-[#66f4e8] text-[#eaf5ff] transition-all cursor-pointer"
          >
            <Save size={13} />
            <span>Salvar agora</span>
          </button>

          <button
            onClick={onNewWorld}
            className="flex items-center justify-center gap-1.5 text-xs py-2 px-1 rounded-lg bg-[#15253b] hover:bg-[#2d1b28] border border-[#34506e] hover:border-[#ff5fa2] text-[#eaf5ff] transition-all cursor-pointer"
          >
            <RefreshCw size={13} className="text-[#ff5fa2]" />
            <span>Novo mundo</span>
          </button>
        </div>

        <p className="text-[10px] text-[#7f96b3] mt-2 leading-relaxed">
          {player.buildMode
            ? '▦ Construção ativa: clique no terreno a até 4 blocos de distância.'
            : player.inVehicle
            ? '▰ Veículo ativo: velocidade duplicada pelas ruas neon.'
            : '◎ Exploração ativa: explore os setores e aproxime-se dos habitantes.'}
        </p>
      </section>

      {/* NPCS & MEMORY */}
      <section className="bg-[#0d1727] border border-[#263b56] rounded-xl p-3 shadow-sm">
        <h2 className="text-[11px] font-bold tracking-widest text-[#66f4e8] uppercase mb-1.5 flex items-center justify-between">
          <span>HABITANTES</span>
          <span className="text-[10px] text-[#8199b5] font-normal">{npcs.length} cidadãos</span>
        </h2>
        <div className="divide-y divide-[#1c2d43]">
          {npcs.map((n) => (
            <div
              key={n.id}
              onClick={() => onSelectNPC?.(n)}
              className="py-1.5 flex items-center justify-between text-xs hover:bg-[#121f33] px-1 rounded transition-colors cursor-pointer"
              title="Clique para ver detalhes do personagem"
            >
              <div>
                <b className="text-[#eaf5ff] font-semibold">{n.name}</b>
                <span className="text-[#9bb0c9] text-[10px] ml-1.5">· {n.mood}</span>
                <span className="text-[9px] text-[#647c9b] block">{n.role}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-xs ${n.trust >= 3 ? 'text-[#ffd166]' : 'text-[#ff5fa2]'}`}>♥</span>
                <span className="text-[11px] text-[#c0d4ed] font-bold">{n.trust}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EVENT LOG */}
      <section className="bg-[#0d1727] border border-[#263b56] rounded-xl p-3 shadow-sm flex-1 min-h-[90px]">
        <h2 className="text-[11px] font-bold tracking-widest text-[#66f4e8] uppercase mb-1.5">
          REGISTRO DA CIDADE
        </h2>
        <div className="max-h-28 overflow-y-auto text-[11px] text-[#b5c7dc] flex flex-col gap-1 pr-1" tabIndex={0} aria-label="Histórico de eventos">
          {log.slice(0, 10).map((msg, i) => (
            <p key={i} className="m-0 leading-tight">
              <span className="text-[#66f4e8] mr-1">›</span>
              {msg}
            </p>
          ))}
        </div>
      </section>

      {/* KEYBOARD SHORTCUTS HINT */}
      <div className="text-[10px] text-[#637c9b] px-1 pb-1">
        NEON FRONTIER · Build 1.0 React<br />
        Teclas: <span className="text-[#9bb0c9]">WASD / E / B / F / Q / Esc</span>
      </div>
    </aside>
  );
};
