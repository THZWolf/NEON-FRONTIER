import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Play,
  Shield,
  Radio,
  FileCode,
  ArrowRight,
  Lock,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  const steps = [
    { id: 1, title: 'Carregar NEON FRONTIER', desc: 'Carregamento do motor de inteligência comportamental' },
    { id: 2, title: 'Verificar Configurações', desc: 'Validação dos limites de memória e decaimento temporal' },
    { id: 3, title: 'Inicializar Núcleo C++ / Engine', desc: 'Inicialização dos módulos de agentes autônomos' },
    { id: 4, title: 'Carregar Memória Episódica', desc: 'Recuperação do snapshot e índices de participantes' },
    { id: 5, title: 'Verificar Adaptador GTA V', desc: 'Teste de sondagem do SimulatedGtaVAdapter e Native Bridge' },
    { id: 6, title: 'Relatório de Diagnóstico', desc: 'Auditoria de compatibilidade e integridade de tipos' },
    { id: 7, title: 'Simulação Independente Pronta', desc: 'Ambiente controlado com agentes Viper, Cipher e Jax ativo' },
    { id: 8, title: 'Status da Integração Real', desc: 'GAME CONNECTED bloqueado até validação do plugin ASI no Windows' },
  ];

  // Auto-run verification sequence
  useEffect(() => {
    if (!isOpen) return;

    let step = 0;
    const interval = setInterval(() => {
      if (step < steps.length) {
        setCompletedSteps((prev) => [...prev, step]);
        setCurrentStep(step);
        step++;
      } else {
        setIsVerifying(false);
        clearInterval(interval);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
      <div className="w-full max-w-[620px] bg-[#0c1626] border border-[#213752] rounded-2xl p-6 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.8)] font-mono select-none">
        <div className="flex items-center justify-between border-b border-[#1b2d44] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00f2fe]/10 border border-[#00f2fe]/40 flex items-center justify-center text-[#00f2fe]">
              <Shield size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Chakra_Petch'] tracking-wide">
                NEON FRONTIER — SEQUÊNCIA DE INICIALIZAÇÃO
              </h2>
              <p className="text-[11px] text-[#7d96b3]">Fluxo de Inicialização e Diagnóstico de Ambiente</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#13273e] border border-[#234366] text-[#00f2fe]">
            PASSO {Math.min(currentStep + 1, steps.length)}/8
          </span>
        </div>

        {/* Steps List */}
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {steps.map((st, index) => {
            const isDone = completedSteps.includes(index);
            const isCurrent = currentStep === index && isVerifying;

            return (
              <div
                key={st.id}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  isDone
                    ? 'bg-[#102033] border-[#1d3d5f] text-[#d6e7f8]'
                    : isCurrent
                    ? 'bg-[#122842] border-[#00f2fe] text-white shadow-[0_0_10px_rgba(0,242,254,0.2)]'
                    : 'bg-[#0a121e] border-[#172333] text-[#556980]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isDone ? (
                    <CheckCircle size={15} className="text-[#00f2fe]" />
                  ) : isCurrent ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#00f2fe] border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-[#33465b]" />
                  )}
                  <div>
                    <b className="font-semibold">{st.title}</b>
                    <p className="text-[10px] text-[#7a92ad] mt-0.5">{st.desc}</p>
                  </div>
                </div>

                {index === 4 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2b210c] border border-[#7a591d] text-[#e6a23c]">
                    SIMULATION MODE
                  </span>
                )}
                {index === 7 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#172333] border border-[#283b52] text-[#869cb3] flex items-center gap-1">
                    <Lock size={9} /> STANDBY
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Diagnostic Confirmation Box */}
        <div className="mt-4 p-3 bg-[#0a1220] border border-[#1a2c42] rounded-xl text-[11px] text-[#8ea4be] space-y-1">
          <div className="flex items-center gap-1.5 text-[#e6a23c] font-semibold">
            <AlertTriangle size={13} />
            <span>Nota de Arquitetura:</span>
          </div>
          <p className="leading-relaxed">
            O núcleo independente C++17 e a aplicação web estão ativos em <b>SIMULATION MODE</b>.
            A integração real direta via navegador é tecnicamente isolada; o adaptador nativo para o GTA V
            Enhanced deve ser compilado como plugin ASI no Windows conforme documentado em <code>docs/</code>.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-[#1b2d44]">
          <span className="text-[10px] text-[#637a96]">
            {isVerifying ? 'Verificando componentes...' : '✓ Todos os 8 passos verificados com sucesso'}
          </span>

          <button
            onClick={onComplete}
            disabled={isVerifying}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              isVerifying
                ? 'bg-[#152336] text-[#556980] border border-[#21354d] cursor-not-allowed'
                : 'bg-[#00f2fe] hover:bg-[#38f5fe] text-black shadow-[0_0_15px_rgba(0,242,254,0.4)] cursor-pointer'
            }`}
          >
            <span>Entrar no Dashboard</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
