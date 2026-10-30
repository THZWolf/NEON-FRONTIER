import React from 'react';
import { NPCState } from '../types/game';
import { Play, RotateCcw, HelpCircle, X, Heart, Shield, Radio } from 'lucide-react';

interface StartModalProps {
  isOpen: boolean;
  hasSave: boolean;
  onStartNew: () => void;
  onContinue: () => void;
  onOpenHelp: () => void;
}

export const StartModal: React.FC<StartModalProps> = ({
  isOpen,
  hasSave,
  onStartNew,
  onContinue,
  onOpenHelp,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-gradient-to-br from-[#070d18f0] to-[#0a1224f0] backdrop-blur-sm select-none font-sans">
      <div className="w-full max-w-[540px] bg-[#0c1728]/95 border border-[#35506d] rounded-2xl p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.6)]">
        <div className="text-[11px] font-mono tracking-[0.2em] text-[#66f4e8] uppercase font-bold">
          UMA EXPERIÊNCIA INDEPENDENTE
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-wider text-[#ffffff] my-2 font-['Chakra_Petch'] leading-tight">
          NEON <br />
          <span className="text-[#66f4e8] drop-shadow-[0_0_12px_rgba(102,244,232,0.5)]">FRONTIER</span>
        </h2>
        <p className="text-sm text-[#b8c9dc] leading-relaxed mt-2 font-mono">
          Explore uma metrópole neon em 2D, colete materiais essenciais, construa seu refúgio,
          conheça personagens marcantes e atravesse a cidade a pé ou no seu veículo hover.
        </p>

        <div className="grid grid-cols-3 gap-2.5 my-5 font-mono">
          <div className="p-3 bg-[#101e31] border border-[#273b53] rounded-xl text-center">
            <b className="text-xs text-[#ffffff] block">EXPLORAR</b>
            <small className="text-[10px] text-[#9bb0c9]">100x80 setores</small>
          </div>
          <div className="p-3 bg-[#101e31] border border-[#273b53] rounded-xl text-center">
            <b className="text-xs text-[#66f4e8] block">CONSTRUIR</b>
            <small className="text-[10px] text-[#9bb0c9]">Recursos locais</small>
          </div>
          <div className="p-3 bg-[#101e31] border border-[#273b53] rounded-xl text-center">
            <b className="text-xs text-[#ffd166] block">INTERAGIR</b>
            <small className="text-[10px] text-[#9bb0c9]">NPCs com memória</small>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 font-mono">
          <button
            onClick={onStartNew}
            className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl bg-[#0d4b52] hover:bg-[#135f68] border border-[#2b8b8b] hover:border-[#66f4e8] text-[#eaf5ff] text-xs font-bold transition-all shadow-[0_0_15px_rgba(102,244,232,0.2)] cursor-pointer flex items-center justify-center gap-2"
          >
            <Play size={14} className="text-[#66f4e8]" />
            <span>Iniciar Novo Jogo</span>
          </button>

          {hasSave && (
            <button
              onClick={onContinue}
              className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl bg-[#15253b] hover:bg-[#1f3757] border border-[#34506e] hover:border-[#66f4e8] text-[#eaf5ff] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} className="text-[#ffd166]" />
              <span>Continuar Save</span>
            </button>
          )}

          <button
            onClick={onOpenHelp}
            className="py-2.5 px-4 rounded-xl bg-[#15253b] hover:bg-[#1f3757] border border-[#34506e] hover:border-[#66f4e8] text-[#eaf5ff] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <HelpCircle size={14} />
            <span>Controles</span>
          </button>
        </div>

        <p className="text-[11px] text-[#7088a6] mt-4 font-mono">
          Save local automático no navegador. Sem contas ou servidores externos.
        </p>
      </div>
    </div>
  );
};

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onSave: () => void;
  onOpenMenu: () => void;
  onOpenHelp: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onSave,
  onOpenMenu,
  onOpenHelp,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-gradient-to-br from-[#070d18ee] to-[#0a1224ee] backdrop-blur-sm select-none font-mono">
      <div className="w-full max-w-[440px] bg-[#0c1728]/95 border border-[#35506d] rounded-2xl p-6 sm:p-7 shadow-[0_20px_70px_rgba(0,0,0,0.6)]">
        <div className="text-[11px] tracking-[0.18em] text-[#66f4e8] uppercase font-bold">
          JOGO PAUSADO
        </div>
        <h2 className="text-2xl font-black text-[#ffffff] my-1 font-['Chakra_Petch']">
          Respire. A metrópole aguarda.
        </h2>
        <p className="text-xs text-[#b8c9dc] leading-relaxed mb-5">
          Seu progresso é salvo automaticamente a cada movimento, interação e construção.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onResume}
            className="py-2.5 px-4 rounded-xl bg-[#0d4b52] hover:bg-[#135f68] border border-[#2b8b8b] hover:border-[#66f4e8] text-[#eaf5ff] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Play size={14} className="text-[#66f4e8]" />
            <span>Continuar Exploração</span>
          </button>

          <button
            onClick={onSave}
            className="py-2.5 px-4 rounded-xl bg-[#15253b] hover:bg-[#1f3757] border border-[#34506e] hover:border-[#66f4e8] text-[#eaf5ff] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Forçar Salvar Agora</span>
          </button>

          <button
            onClick={onOpenHelp}
            className="py-2.5 px-4 rounded-xl bg-[#15253b] hover:bg-[#1f3757] border border-[#34506e] hover:border-[#66f4e8] text-[#eaf5ff] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <HelpCircle size={14} />
            <span>Guia de Controles</span>
          </button>

          <button
            onClick={onOpenMenu}
            className="py-2.5 px-4 rounded-xl bg-[#15253b] hover:bg-[#2e1d2c] border border-[#34506e] hover:border-[#ff5fa2] text-[#eaf5ff] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <span>Menu Inicial</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-gradient-to-br from-[#070d18ee] to-[#0a1224ee] backdrop-blur-sm select-none font-mono">
      <div className="w-full max-w-[500px] bg-[#0c1728]/95 border border-[#35506d] rounded-2xl p-6 sm:p-7 shadow-[0_20px_70px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] tracking-[0.18em] text-[#66f4e8] uppercase font-bold">
            MANUAL DO EXPLORADOR
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9cb0c8] hover:text-[#eaf5ff] hover:bg-[#1a2b42] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <h2 className="text-2xl font-black text-[#ffffff] font-['Chakra_Petch'] mb-3">
          Como Jogar na Fronteira
        </h2>

        <div className="space-y-3 text-xs text-[#b8c9dc]">
          <div className="p-3 bg-[#111e30] border border-[#233852] rounded-xl">
            <b className="text-[#66f4e8] block mb-1">🎮 Teclas de Ação</b>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div><span className="bg-[#1b2b40] px-1.5 py-0.5 rounded border border-[#314763] text-white">WASD / Setas</span> : Mover</div>
              <div><span className="bg-[#1b2b40] px-1.5 py-0.5 rounded border border-[#314763] text-white">E</span> : Falar com NPC</div>
              <div><span className="bg-[#1b2b40] px-1.5 py-0.5 rounded border border-[#314763] text-white">B</span> : Modo Construção</div>
              <div><span className="bg-[#1b2b40] px-1.5 py-0.5 rounded border border-[#314763] text-white">F</span> : Veículo Hover</div>
              <div><span className="bg-[#1b2b40] px-1.5 py-0.5 rounded border border-[#314763] text-white">Q</span> : Coletar Recursos</div>
              <div><span className="bg-[#1b2b40] px-1.5 py-0.5 rounded border border-[#314763] text-white">Esc</span> : Pausar</div>
            </div>
          </div>

          <div className="p-3 bg-[#111e30] border border-[#233852] rounded-xl">
            <b className="text-[#ffd166] block mb-1">▦ Modo Construção</b>
            <p className="text-[11px] leading-relaxed">
              Ative com <b>B</b>. Clique em qualquer terreno vago a até 4 blocos para erguer um bloco sólido
              gastando 1 material. Clique num bloco existente para desmontá-lo e recuperar o recurso.
            </p>
          </div>

          <div className="p-3 bg-[#111e30] border border-[#233852] rounded-xl">
            <b className="text-[#ff5fa2] block mb-1">◈ Cristais & Sucata</b>
            <p className="text-[11px] leading-relaxed">
              Pressione <b>Q</b> para coletar cristais brilhantes (+2 materiais, +3 créditos) ou sucata (+1 material, +1 crédito).
              Se não houver nada perto, um radar detectará pontos ocultos no quadrante.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 px-4 rounded-xl bg-[#0d4b52] hover:bg-[#135f68] border border-[#2b8b8b] hover:border-[#66f4e8] text-[#eaf5ff] text-xs font-bold transition-all cursor-pointer"
        >
          Retornar ao Jogo
        </button>
      </div>
    </div>
  );
};

interface NPCModalProps {
  npc: NPCState | null;
  onClose: () => void;
  onInteract: (npc: NPCState) => void;
}

export const NPCModal: React.FC<NPCModalProps> = ({ npc, onClose, onInteract }) => {
  if (!npc) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-gradient-to-br from-[#070d18ee] to-[#0a1224ee] backdrop-blur-sm select-none font-mono">
      <div className="w-full max-w-[460px] bg-[#0c1728]/95 border border-[#35506d] rounded-2xl p-6 shadow-[0_20px_70px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#14263f] border border-[#345173] flex items-center justify-center text-xl font-bold text-[#66f4e8] shadow-[0_0_10px_rgba(102,244,232,0.3)]">
              {npc.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white font-['Chakra_Petch']">{npc.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1b2b40] border border-[#34506e] text-[#66f4e8]">
                  {npc.mood}
                </span>
              </div>
              <p className="text-[11px] text-[#9bb0c9]">{npc.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9cb0c8] hover:text-[#eaf5ff] hover:bg-[#1a2b42] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="my-4 p-3 bg-[#101e31] border border-[#253a54] rounded-xl">
          <div className="flex items-center justify-between text-xs text-[#9bb0c9] mb-1.5">
            <span className="flex items-center gap-1">
              <Heart size={12} className={npc.trust >= 3 ? 'text-[#ffd166]' : 'text-[#ff5fa2]'} /> Nível de Confiança
            </span>
            <span className="font-bold text-white">{npc.trust} / 5</span>
          </div>
          <div className="h-1.5 bg-[#172538] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                npc.trust >= 3 ? 'bg-[#ffd166]' : 'bg-[#ff5fa2]'
              }`}
              style={{ width: `${Math.min(100, (npc.trust / 5) * 100)}%` }}
            />
          </div>
        </div>

        <div className="mb-4">
          <b className="text-[11px] text-[#66f4e8] block mb-1.5 flex items-center gap-1">
            <Radio size={12} /> Diálogo Atual:
          </b>
          <div className="p-3 bg-[#0d1727] border border-[#1e324c] rounded-lg text-xs italic text-[#eaf5ff]">
            {npc.dialoguePool[npc.trust % npc.dialoguePool.length]}
          </div>
        </div>

        <div>
          <b className="text-[11px] text-[#9bb0c9] block mb-1">Memórias Registradas:</b>
          <div className="max-h-24 overflow-y-auto space-y-1 text-[11px] text-[#7f99b5]">
            {npc.memory.length === 0 ? (
              <p className="italic">Nenhum encontro registrado anteriormente.</p>
            ) : (
              npc.memory.map((m, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <span className="text-[#66f4e8]">›</span>
                  <span>{m}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={() => onInteract(npc)}
            className="flex-1 py-2 px-3 rounded-xl bg-[#0d4b52] hover:bg-[#135f68] border border-[#2b8b8b] hover:border-[#66f4e8] text-white text-xs font-bold transition-all cursor-pointer"
          >
            Conversar (+2 Créditos)
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-[#15253b] hover:bg-[#1e3450] border border-[#34506e] text-[#9bb0c9] text-xs font-bold transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
