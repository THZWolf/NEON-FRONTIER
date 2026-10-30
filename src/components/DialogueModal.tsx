import React, { useState } from 'react';
import { MessageSquare, Heart, Database, Send, X, Shield, Clock } from 'lucide-react';
import { NPCInstance } from '../game3d/npc/NPCManager';
import { npcMemoryStore, NPCMemoryRecord } from '../game3d/npc/NPCMemory';
import { gameAudio } from '../game3d/core/Audio';

interface DialogueModalProps {
  npc: NPCInstance;
  initialDialogue: string;
  playerCredits: number;
  onUpdateCredits: (newAmount: number) => void;
  onClose: () => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  npc,
  initialDialogue,
  playerCredits,
  onUpdateCredits,
  onClose,
}) => {
  const [currentDialogue, setCurrentDialogue] = useState(initialDialogue);
  const [showMemories, setShowMemories] = useState(false);
  const [trust, setTrust] = useState(npc.trustLevel);
  const [memories, setMemories] = useState<NPCMemoryRecord[]>(() =>
    npcMemoryStore.getMemoriesFor(npc.data.id)
  );

  const handleTalkMore = () => {
    const nextLine = npc.interact();
    setCurrentDialogue(nextLine);
    setMemories(npcMemoryStore.getMemoriesFor(npc.data.id));
    setTrust(npc.trustLevel);
  };

  const handleBribeOrGift = () => {
    if (playerCredits < 10) return;
    onUpdateCredits(playerCredits - 10);
    gameAudio.playInteract();

    npc.trustLevel = Math.min(5, npc.trustLevel + 1);
    setTrust(npc.trustLevel);

    npcMemoryStore.recordEvent(
      npc.data.id,
      'TRADE_COMPLETED',
      `O jogador transferiu 10 créditos e dados de segurança. Nível de confiança subiu para ${npc.trustLevel}/5.`,
      0.8,
      ['player', npc.data.name]
    );

    setCurrentDialogue(
      `"Agradeço o repasse de créditos, Operativo. Minha lealdade e fontes de informação no distrito agora são prioritárias para você."`
    );
    setMemories(npcMemoryStore.getMemoriesFor(npc.data.id));
  };

  const hexColor = `#${npc.data.colorHex.toString(16).padStart(6, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md font-mono select-none">
      <div className="w-full max-w-xl bg-[#08101e] border-2 border-[#1c3558] rounded-2xl shadow-[0_0_50px_rgba(0,242,254,0.15)] overflow-hidden flex flex-col">
        {/* Header with NPC Badge */}
        <div className="px-5 py-4 border-b border-[#1b2f4b] flex items-center justify-between bg-[#0b172a]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-white/20"
              style={{ backgroundColor: hexColor }}
            >
              <Shield size={20} className="text-black font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-['Chakra_Petch'] tracking-wide">
                  {npc.data.name}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#132742] text-[#00f2fe] border border-[#21436e]">
                  {npc.data.role}
                </span>
              </div>
              {/* Trust Meter */}
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#8ea8cc]">
                <span>Confiança:</span>
                <div className="flex items-center gap-0.5 text-[#ff4d8d]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Heart
                      key={star}
                      size={12}
                      className={star <= trust ? 'fill-[#ff4d8d]' : 'text-slate-600'}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-400">({trust}/5)</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#162742] transition-colors cursor-pointer"
            title="Fechar (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 space-y-4">
          {/* Main Dialogue Box */}
          <div className="p-4 rounded-xl bg-[#0e1a2f] border border-[#223d64] relative">
            <div className="text-xs uppercase tracking-wider text-[#00f2fe] mb-1 font-semibold flex items-center gap-1.5">
              <MessageSquare size={13} /> Transmissão Vocal
            </div>
            <p className="text-sm text-cyan-50 leading-relaxed font-sans">{currentDialogue}</p>
          </div>

          {/* Episodic Memory Inspector Drawer */}
          {showMemories && (
            <div className="p-3 rounded-xl bg-[#091322] border border-[#1a314f] max-h-48 overflow-y-auto space-y-2">
              <div className="text-[11px] font-bold text-[#8fa7c7] flex items-center gap-1.5 border-b border-[#162842] pb-1">
                <Database size={12} className="text-[#00f2fe]" /> Memória Episódica Persistente
                ({memories.length} registros)
              </div>
              {memories.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  Nenhum registro prévio com este indivíduo.
                </p>
              ) : (
                memories.map((m, idx) => (
                  <div
                    key={`${m.id}_${idx}`}
                    className="p-2 rounded bg-[#0f1f35] border border-[#1b3456] text-[11px] text-slate-300"
                  >
                    <div className="flex justify-between items-center text-[10px] text-cyan-400 mb-0.5">
                      <span className="font-bold">{m.eventType}</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock size={10} /> {new Date(m.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-slate-200">{m.description}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-[#1b2f4b] bg-[#070e1c] grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={handleTalkMore}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#133054] hover:bg-[#1a4173] text-white border border-[#235084] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Send size={13} className="text-[#00f2fe]" /> Continuar Conversa
          </button>

          <button
            onClick={handleBribeOrGift}
            disabled={playerCredits < 10}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              playerCredits >= 10
                ? 'bg-[#1b2f23] hover:bg-[#254531] text-[#74e39b] border-[#2c6140]'
                : 'bg-[#151c24] text-slate-600 border-[#222a36] cursor-not-allowed'
            }`}
            title="Gasta 10 créditos para aumentar a confiança do NPC"
          >
            <Heart size={13} /> Oferecer 10 Créditos
          </button>

          <button
            onClick={() => setShowMemories(!showMemories)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#0f1f33] hover:bg-[#182e4b] text-[#9db7d9] border border-[#233d60] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Database size={13} className="text-[#00f2fe]" />
            {showMemories ? 'Ocultar Memória' : 'Inspecionar Memória'}
          </button>
        </div>
      </div>
    </div>
  );
};
