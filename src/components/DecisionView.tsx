import React from 'react';
import { AgentModel, DecisionExplanation } from '../types/neon';
import { Scale, CheckCircle, AlertCircle, Info, RefreshCw, Layers } from 'lucide-react';

interface DecisionViewProps {
  agents: AgentModel[];
  selectedAgentId: string;
  onSelectAgent: (id: string) => void;
  onEvaluate: (id: string) => DecisionExplanation | null;
}

export const DecisionView: React.FC<DecisionViewProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  onEvaluate,
}) => {
  const currentAgent = agents.find((a) => a.identity.id === selectedAgentId) || agents[0];
  const decision = currentAgent.lastDecisionExplanation;

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Header and Agent Selector */}
      <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Scale size={16} className="text-[#00f2fe]" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider">
              MOTOR DE DECISÃO DETERMINÍSTICO & EXPLICABILIDADE
            </h3>
            <p className="text-[10px] text-[#718dae]">
              Avaliação de utilidade baseada em objetivos, memória episódica e aversão a risco
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={currentAgent.identity.id}
            onChange={(e) => onSelectAgent(e.target.value)}
            className="bg-[#0e192a] border border-[#21354e] rounded-lg px-3 py-1.5 text-xs text-[#d2e4f7] outline-none"
          >
            {agents.map((a) => (
              <option key={a.identity.id} value={a.identity.id}>
                {a.identity.alias} ({a.identity.archetype})
              </option>
            ))}
          </select>

          <button
            onClick={() => onEvaluate(currentAgent.identity.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00f2fe] hover:bg-[#38f5fe] text-black text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,242,254,0.3)] cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Reavaliar</span>
          </button>
        </div>
      </div>

      {!decision ? (
        <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-8 text-center text-xs text-[#627d9c]">
          Nenhuma decisão avaliada ainda para este agente. Clique em &quot;Reavaliar&quot; acima.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Left Column: Decision Outcome Card */}
          <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4 space-y-4">
            <div className="border-b border-[#182a40] pb-3">
              <span className="text-[10px] text-[#708dae] uppercase tracking-wider block mb-1">
                AÇÃO SELECIONADA PELO MOTOR
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-[#00f2fe] font-['Chakra_Petch']">
                  {decision.selectedActionName}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#102a3d] border border-[#1c4d70] text-[#00f2fe] font-bold">
                  Confiança: {Math.round(decision.finalConfidence * 100)}%
                </span>
              </div>
            </div>

            {/* Primary Factor Badge */}
            <div className="p-3 bg-[#0e192a] border border-[#1a2e46] rounded-xl space-y-1">
              <span className="text-[10px] text-[#ff5fa2] font-bold uppercase block">
                FATOR DETERMINANTE PRIMÁRIO
              </span>
              <b className="text-xs text-white block">{decision.primaryDecidingFactor}</b>
              <p className="text-[10px] text-[#7b96b3] mt-1 leading-relaxed">
                A decisão foi selecionada maximizando a função de utilidade ponderada entre objetivos e histórico.
              </p>
            </div>

            {/* Algorithmic Reasoning Statement (Strictly non-anthropomorphic) */}
            <div className="p-3 bg-[#0e192a] border border-[#1a2e46] rounded-xl space-y-1.5">
              <span className="text-[10px] text-[#ffd166] font-bold uppercase flex items-center gap-1">
                <Info size={11} /> TRACE DE RACIOCÍNIO CONTEXTUAL
              </span>
              <p className="text-xs text-[#b8cfe8] leading-relaxed italic">
                &ldquo;{decision.contextualReasoning}&rdquo;
              </p>
            </div>

            {/* Influenced Memories List */}
            <div>
              <span className="text-[10px] font-bold text-[#718ea8] uppercase tracking-wider block mb-1.5">
                MEMÓRIAS QUE INFLUENCIARAM A ESCOLHA
              </span>
              {decision.memoriesInfluenced.length === 0 ? (
                <p className="text-[11px] text-[#556e87] italic">
                  Nenhuma memória antiga teve peso determinante nesta decisão inicial.
                </p>
              ) : (
                <div className="space-y-1">
                  {decision.memoriesInfluenced.map((mid) => (
                    <div
                      key={mid}
                      className="p-2 bg-[#0e192a] border border-[#18293e] rounded-lg text-[10px] text-[#8eaecf] flex items-center justify-between"
                    >
                      <span>Registro de Memória: {mid}</span>
                      <span className="text-[#00f2fe]">Ativo</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Two Columns: Candidates Utility Comparison Table */}
          <div className="lg:col-span-2 bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#182a40] pb-2">
              <h4 className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-[#00f2fe]" /> COMPARATIVO DE CANDIDATAS AVALIADAS
              </h4>
              <span className="text-[10px] text-[#6d88a6]">
                Fórmula: U = 0.35·G + 0.30·M + 0.25·R - 0.10·C
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#182b42] text-[10px] text-[#718dae]">
                    <th className="pb-2">Ação Candidata</th>
                    <th className="pb-2 text-center">Objetivo (0.35)</th>
                    <th className="pb-2 text-center">Memória (0.30)</th>
                    <th className="pb-2 text-center">Risco (0.25)</th>
                    <th className="pb-2 text-center">Custo (-0.10)</th>
                    <th className="pb-2 text-right">Score Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#152438]">
                  {decision.candidateEvaluations.map((cand) => {
                    const isWinner = cand.actionName === decision.selectedActionName;
                    return (
                      <tr
                        key={cand.actionName}
                        className={`transition-colors ${
                          isWinner ? 'bg-[#10283d] font-bold text-[#00f2fe]' : 'text-[#a2bedb] hover:bg-[#0e1828]'
                        }`}
                      >
                        <td className="py-2.5 flex items-center gap-1.5">
                          {isWinner && <CheckCircle size={13} className="text-[#00f2fe]" />}
                          <span>{cand.actionName}</span>
                        </td>
                        <td className="py-2.5 text-center">{cand.goalAlignmentScore.toFixed(2)}</td>
                        <td className="py-2.5 text-center">{cand.memoryBiasScore.toFixed(2)}</td>
                        <td className="py-2.5 text-center">{cand.riskDeterrenceScore.toFixed(2)}</td>
                        <td className="py-2.5 text-center text-[#f56c6c]">-{cand.costPenalty.toFixed(2)}</td>
                        <td className="py-2.5 text-right font-mono text-sm">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              isWinner
                                ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/50'
                                : 'text-[#87a2c0]'
                            }`}
                          >
                            {cand.finalUtilityScore.toFixed(3)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Visual Utility Bars */}
            <div className="space-y-2 pt-2 border-t border-[#182a40]">
              <span className="text-[10px] font-bold text-[#718dae] uppercase tracking-wider block mb-2">
                DISTRIBUIÇÃO GRÁFICA DE UTILIDADE
              </span>
              {decision.candidateEvaluations.map((cand) => {
                const isWinner = cand.actionName === decision.selectedActionName;
                const widthPct = Math.max(5, Math.min(100, Math.round(cand.finalUtilityScore * 100)));
                return (
                  <div key={cand.actionName} className="space-y-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className={isWinner ? 'text-[#00f2fe] font-bold' : 'text-[#7d97b3]'}>
                        {cand.actionName}
                      </span>
                      <span className={isWinner ? 'text-[#00f2fe] font-bold' : 'text-[#7d97b3]'}>
                        {cand.finalUtilityScore.toFixed(3)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#142030] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isWinner ? 'bg-[#00f2fe]' : 'bg-[#294261]'
                        }`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
