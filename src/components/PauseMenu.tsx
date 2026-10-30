import React from 'react';
import { Play, RotateCcw, Compass, Settings, Code2, LogOut, X, Trash2 } from 'lucide-react';
import { npcMemoryStore } from '../game3d/npc/NPCMemory';

interface PauseMenuProps {
  onResume: () => void;
  onResetPosition: () => void;
  onOpenExport: () => void;
  onReturnToMainMenu: () => void;
  onResetMemories: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onResetPosition,
  onOpenExport,
  onReturnToMainMenu,
  onResetMemories,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none font-mono">
      <div className="w-full max-w-md bg-[#08101e] border-2 border-[#1c3658] rounded-2xl shadow-[0_0_60px_rgba(0,242,254,0.18)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1b3456] flex items-center justify-between bg-[#0c182b]">
          <div>
            <h2 className="text-base font-bold text-white tracking-widest font-['Chakra_Petch']">
              SIMULAÇÃO PAUSADA
            </h2>
            <p className="text-[11px] text-slate-400">NEON FRONTIER 3D · SISTEMA OPERACIONAL</p>
          </div>
          <button
            onClick={onResume}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#162742] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu Buttons */}
        <div className="p-6 space-y-2.5">
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-gradient-to-r from-[#00b4db] to-[#0083b0] hover:from-[#00c6ff] hover:to-[#0072ff] text-white font-bold text-xs tracking-wider transition-all cursor-pointer"
          >
            <Play size={16} className="fill-white" /> RETOMAR JOGO (ESC)
          </button>

          <button
            onClick={onResetPosition}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0e1d32] hover:bg-[#162c4a] text-slate-200 border border-[#1d3c63] text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw size={14} className="text-[#00f2fe]" /> Redefinir Posição (Nexus Plaza)
          </button>

          <button
            onClick={onResetMemories}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1c1218] hover:bg-[#2b1823] text-rose-300 border border-rose-900/60 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 size={14} className="text-rose-400" /> Reiniciar Memórias dos NPCs
          </button>

          <button
            onClick={onOpenExport}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0e1d32] hover:bg-[#162c4a] text-slate-200 border border-[#1d3c63] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Code2 size={14} className="text-emerald-400" /> Exportar Código-Fonte Completo
          </button>

          <button
            onClick={onReturnToMainMenu}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#09111c] hover:bg-[#121c2e] text-slate-400 hover:text-white border border-[#142338] text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut size={14} /> Voltar ao Menu Inicial
          </button>
        </div>

        {/* Footer controls reminder */}
        <div className="px-6 py-3 border-t border-[#1b3456] bg-[#050b14] text-[10px] text-slate-400 text-center">
          Dica: Pressione <span className="text-[#00f2fe] font-bold">F3</span> durante o jogo para alternar
          o painel de diagnóstico em tempo real.
        </div>
      </div>
    </div>
  );
};
