import React, { useState } from 'react';
import { Target, Users, ShieldAlert, DollarSign, X, CheckCircle, FileText, Play } from 'lucide-react';
import { gameAudio } from '../game3d/core/Audio';

interface HeistBoardModalProps {
  playerCredits: number;
  onAddCredits: (amount: number) => void;
  onClose: () => void;
}

interface HeistPlan {
  id: string;
  title: string;
  location: string;
  difficulty: 'MÉDIO' | 'DIFÍCIL' | 'EXTREMO';
  reward: number;
  desc: string;
  roles: string[];
  intel: string[];
}

const HEISTS: HeistPlan[] = [
  {
    id: 'heist_yacht',
    title: 'INFILTRAÇÃO NO MEGAIATE NEON',
    location: 'Baía & Marina Sul',
    difficulty: 'MÉDIO',
    reward: 120,
    desc: 'Assaltar o cofre privado do oligarca corporativo a bordo do megaiate ancorado na marina.',
    roles: ['Maya Lin (Infiltração)', 'Victor Cruz (Fuga em Barco Rápido)'],
    intel: ['Patrulhas náuticas no perímetro', 'Cofre criptografado com chave quântica', 'Rota de escape pela costa leste'],
  },
  {
    id: 'heist_datacore',
    title: 'EXTRAÇÃO DO DATACORE NEXUS',
    location: 'Subsolo da Torre Nexus-01',
    difficulty: 'DIFÍCIL',
    reward: 180,
    desc: 'Roubar a inteligência artificial proprietária do datacenter subterrâneo antes da queima de arquivo.',
    roles: ['Alex Mercer (Assalto Tático)', 'Maya Lin (Bypass de Firewall)'],
    intel: ['Drones sentinelas armados com laser', 'Sensores de pressão biométricos', 'Bloqueio de comunicação de 4 minutos'],
  },
  {
    id: 'heist_casino',
    title: 'GOLPE NO CASSINO SYNDICATE',
    location: 'Grande Cassino Neon Frontier',
    difficulty: 'EXTREMO',
    reward: 350,
    desc: 'O golpe supremo da cidade: desativar o gerador principal, furar o cofre de barras de neodímio e escapar pelo viaduto.',
    roles: ['Alex Mercer (Líder de Fogo)', 'Maya Lin (Hacking Central)', 'Victor Cruz (Supercarro Blindado)'],
    intel: ['Força de resposta tática com 5 viaturas', 'Câmeras térmicas de alta frequência', 'Tempo estimado de fuga: 180 segundos'],
  },
];

export const HeistBoardModal: React.FC<HeistBoardModalProps> = ({
  playerCredits,
  onAddCredits,
  onClose,
}) => {
  const [selectedHeist, setSelectedHeist] = useState<HeistPlan>(HEISTS[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleStartHeist = () => {
    setIsExecuting(true);
    setExecutionProgress(0);
    gameAudio.playWantedLevelUp();

    const interval = setInterval(() => {
      setExecutionProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExecuting(false);
          setCompleted(true);
          onAddCredits(selectedHeist.reward);
          gameAudio.playNitroBoost();
          return 100;
        }
        return prev + 25;
      });
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono select-none">
      <div className="relative w-full max-w-4xl bg-[#100b05] border-2 border-[#ffaa00] rounded-2xl shadow-[0_0_40px_rgba(255,170,0,0.35)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3b280e] bg-[#211709]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#ffaa00]/20 border border-[#ffaa00]/50 text-[#ffaa00]">
              <Target size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                SALA DE PREPARAÇÃO DE <span className="text-[#ffaa00]">GOLPE</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#ffaa00]/20 text-[#ffaa00] border border-[#ffaa00]/40">
                  QUADRO TÁTICO HOLOGRÁFICO
                </span>
              </h2>
              <p className="text-xs text-[#c49a60]">Planejamento estratégico de operações de alto risco</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#322008] hover:bg-[#4a300c] text-[#e6b97e] hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Mission Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {HEISTS.map((heist) => (
              <button
                key={heist.id}
                onClick={() => {
                  setSelectedHeist(heist);
                  setCompleted(false);
                  gameAudio.playInteract();
                }}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedHeist.id === heist.id
                    ? 'bg-[#291b07] border-[#ffaa00] shadow-[0_0_15px_rgba(255,170,0,0.3)]'
                    : 'bg-[#181006] border-[#382610] hover:border-[#604218]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ffaa00]/20 text-[#ffaa00]">
                      {heist.difficulty}
                    </span>
                    <span className="text-xs font-bold text-[#ffd166]">+{heist.reward} CR</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1 leading-snug">{heist.title}</div>
                </div>
                <div className="text-[10px] text-[#9c7849] mt-2">{heist.location}</div>
              </button>
            ))}
          </div>

          {/* Active Heist Blueprint Briefing */}
          <div className="p-5 rounded-2xl bg-[#191107] border border-[#3b280e] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText size={16} className="text-[#ffaa00]" />
                  BRIEFING: {selectedHeist.title}
                </h3>
                <p className="text-xs text-[#b89569] mt-1">{selectedHeist.desc}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#9c7849]">PAGAMENTO ESTIMADO</span>
                <div className="text-lg font-bold text-[#ffd166]">+{selectedHeist.reward} CRÉDITOS</div>
              </div>
            </div>

            {/* Crew Allocation */}
            <div>
              <div className="text-[11px] font-bold text-[#ffaa00] mb-2 flex items-center gap-1.5">
                <Users size={14} /> EQUIPE DESIGNADA
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedHeist.roles.map((r, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#261909] text-white border border-[#4d3312]"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Security Intel */}
            <div>
              <div className="text-[11px] font-bold text-[#ffaa00] mb-2 flex items-center gap-1.5">
                <ShieldAlert size={14} /> RELATÓRIO DE SEGURANÇA & INTEL
              </div>
              <ul className="space-y-1 text-xs text-[#d2ad83]">
                {selectedHeist.intel.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffaa00]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Progress or Completion State */}
            {isExecuting && (
              <div className="p-4 rounded-xl bg-[#2a1b06] border border-[#ffaa00] space-y-2 animate-pulse">
                <div className="flex justify-between text-xs font-bold text-[#ffaa00]">
                  <span>OPERANDO GOLPE EM TEMPO REAL...</span>
                  <span>{executionProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#140c03] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ffaa00] to-[#ffd166] transition-all duration-300"
                    style={{ width: `${executionProgress}%` }}
                  />
                </div>
              </div>
            )}

            {completed && (
              <div className="p-4 rounded-xl bg-[#1d3315] border border-[#39ff14] flex items-center gap-3 text-xs text-[#39ff14] font-bold">
                <CheckCircle size={20} />
                <div>
                  <div>OPERAÇÃO CONCLUÍDA COM SUCESSO!</div>
                  <div className="text-[11px] text-[#9df28a]">
                    +{selectedHeist.reward} créditos transferidos para sua conta anônima.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#3b280e] bg-[#211709] flex items-center justify-between text-xs text-[#c49a60]">
          <span>Mesa Tática · safehouse subterrânea</span>
          <div className="flex gap-2">
            <button
              onClick={handleStartHeist}
              disabled={isExecuting}
              className="px-6 py-2 rounded-xl bg-[#ffaa00] hover:bg-[#ffbe33] disabled:opacity-40 text-black font-extrabold flex items-center gap-2 cursor-pointer"
            >
              <Play size={14} />
              EXECUTAR PLANO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
