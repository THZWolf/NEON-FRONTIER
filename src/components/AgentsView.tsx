import React, { useState } from 'react';
import { AgentModel, DecisionExplanation } from '../types/neon';
import {
  Users,
  Shield,
  Heart,
  Compass,
  Target,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle,
} from 'lucide-react';

interface AgentsViewProps {
  agents: AgentModel[];
  selectedAgentId: string;
  onSelectAgent: (agentId: string) => void;
  onEvaluateDecision: (agentId: string) => DecisionExplanation | null;
}

export const AgentsView: React.FC<AgentsViewProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  onEvaluateDecision,
}) => {
  const currentAgent = agents.find((a) => a.identity.id === selectedAgentId) || agents[0];
  const [lastEval, setLastEval] = useState<DecisionExplanation | null>(currentAgent.lastDecisionExplanation || null);

  const handleEvaluate = () => {
    const res = onEvaluateDecision(currentAgent.identity.id);
    if (res) setLastEval(res);
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Agent Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {agents.map((agent) => {
          const isSelected = agent.identity.id === currentAgent.identity.id;
          return (
            <button
              key={agent.identity.id}
              onClick={() => {
                onSelectAgent(agent.identity.id);
                setLastEval(agent.lastDecisionExplanation || null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-[#152e4a] border border-[#00f2fe] text-[#00f2fe] shadow-[0_0_12px_rgba(0,242,254,0.2)]'
                  : 'bg-[#0b1422] hover:bg-[#122236] border border-[#1d2d42] text-[#86a2c2]'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#00f2fe]" />
              <span>{agent.identity.alias}</span>
              <span className="text-[10px] text-[#5e7794] font-normal">({agent.identity.archetype})</span>
            </button>
          );
        })}
      </div>

      {/* Main Agent Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column: Identity & Traits */}
        <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4 space-y-4">
          <div className="flex items-start justify-between border-b border-[#182a40] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white font-['Chakra_Petch']">
                  {currentAgent.identity.alias}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#14263c] border border-[#234366] text-[#00f2fe]">
                  {currentAgent.identity.archetype}
                </span>
              </div>
              <span className="text-[11px] text-[#6a84a3] block">{currentAgent.identity.id}</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#102538] border border-[#1f4263] text-[#78c7ff] font-bold">
                {currentAgent.behavior}
              </span>
              <small className="block text-[9px] text-[#556e8a] mt-1">{currentAgent.execution}</small>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#7d97b3] uppercase tracking-wider block mb-1">
              PERFIL & BIOGRAFIA
            </span>
            <p className="text-xs text-[#b8cfe8] leading-relaxed bg-[#0e192a] border border-[#1a2e46] rounded-xl p-3">
              {currentAgent.identity.backgroundBio}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#7d97b3] uppercase tracking-wider block mb-1.5">
              TRAÇOS COMPORTAMENTAIS
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentAgent.identity.personalityTraits.map((trait, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-1 rounded-lg bg-[#112338] border border-[#213f61] text-[#91bde8]"
                >
                  #{trait}
                </span>
              ))}
            </div>
          </div>

          {/* Personality Weights */}
          <div className="space-y-2 pt-2 border-t border-[#182a40]">
            <span className="text-[10px] font-bold text-[#7d97b3] uppercase tracking-wider block">
              PESOS DE PERSONALIDADE (BASELINE)
            </span>

            <div>
              <div className="flex justify-between text-[10px] text-[#86a2c2] mb-0.5">
                <span>Cautela Operacional:</span>
                <b className="text-white">{Math.round(currentAgent.identity.baselineCaution * 100)}%</b>
              </div>
              <div className="h-1.5 bg-[#142030] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00f2fe]"
                  style={{ width: `${currentAgent.identity.baselineCaution * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-[#86a2c2] mb-0.5">
                <span>Agressividade Reativa:</span>
                <b className="text-white">{Math.round(currentAgent.identity.baselineAggression * 100)}%</b>
              </div>
              <div className="h-1.5 bg-[#142030] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ff5fa2]"
                  style={{ width: `${currentAgent.identity.baselineAggression * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-[#86a2c2] mb-0.5">
                <span>Sociabilidade / Negociação:</span>
                <b className="text-white">{Math.round(currentAgent.identity.baselineSociability * 100)}%</b>
              </div>
              <div className="h-1.5 bg-[#142030] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ffd166]"
                  style={{ width: `${currentAgent.identity.baselineSociability * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Internal Indicators & Trust Matrix */}
        <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#182a40] pb-2">
            <h4 className="text-xs font-bold text-[#00f2fe] tracking-wider flex items-center gap-1.5">
              <Shield size={14} /> INDICADORES INTERNOS (EXCLUSIVOS DO NEON)
            </h4>
            <span className="text-[10px] text-[#6984a3]">Variáveis Próprias</span>
          </div>

          {/* Alert Level Gauge */}
          <div className="p-3 bg-[#0e192a] border border-[#1a2e46] rounded-xl">
            <div className="flex items-center justify-between text-xs text-[#85a1bf] mb-1.5">
              <span>Nível de Alerta Atual:</span>
              <b className="text-base font-bold text-white">
                {Math.round(currentAgent.indicators.alertLevel * 100)}%
              </b>
            </div>
            <div className="h-2 bg-[#142030] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  currentAgent.indicators.alertLevel > 0.6
                    ? 'bg-[#ff5fa2]'
                    : currentAgent.indicators.alertLevel > 0.25
                    ? 'bg-[#ffd166]'
                    : 'bg-[#00f2fe]'
                }`}
                style={{ width: `${currentAgent.indicators.alertLevel * 100}%` }}
              />
            </div>
          </div>

          {/* Trust Matrix */}
          <div>
            <span className="text-[10px] font-bold text-[#7d97b3] uppercase tracking-wider block mb-2 flex items-center gap-1">
              <Heart size={12} className="text-[#ff5fa2]" /> MATRIZ DE CONFIANÇA COM ENTIDADES
            </span>
            <div className="space-y-1.5">
              {Object.entries(currentAgent.indicators.trust).map(([target, val]) => {
                const isPositive = val >= 0;
                return (
                  <div
                    key={target}
                    className="p-2 bg-[#0e192a] border border-[#1a2e46] rounded-lg text-xs flex items-center justify-between"
                  >
                    <span className="text-[#a5bed9]">{target}</span>
                    <span
                      className={`font-bold ${
                        val > 0.3
                          ? 'text-[#67c23a]'
                          : val < -0.3
                          ? 'text-[#f56c6c]'
                          : 'text-[#e6a23c]'
                      }`}
                    >
                      {isPositive ? `+${val.toFixed(2)}` : val.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Familiarity Zones */}
          <div>
            <span className="text-[10px] font-bold text-[#7d97b3] uppercase tracking-wider block mb-2 flex items-center gap-1">
              <Compass size={12} className="text-[#ffd166]" /> ZONAS DE FAMILIARIDADE
            </span>
            <div className="space-y-1.5">
              {Object.entries(currentAgent.indicators.familiarity).map(([zone, val]) => (
                <div
                  key={zone}
                  className="p-2 bg-[#0e192a] border border-[#1a2e46] rounded-lg text-xs flex items-center justify-between"
                >
                  <span className="text-[#a5bed9]">{zone}</span>
                  <span className="font-bold text-[#00f2fe]">{Math.round(val * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Goals & Decision Action */}
        <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#182a40] pb-2">
              <h4 className="text-xs font-bold text-[#00f2fe] tracking-wider flex items-center gap-1.5">
                <Target size={14} /> OBJETIVOS ATIVOS
              </h4>
              <span className="text-[10px] text-[#6984a3]">{currentAgent.activeGoals.length} metas</span>
            </div>

            <div className="space-y-2">
              {currentAgent.activeGoals.map((g) => (
                <div key={g.id} className="p-3 bg-[#0e192a] border border-[#1a2e46] rounded-xl text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <b className="text-white">{g.name}</b>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#16273c] text-[#ffd166] font-bold">
                      Prioridade: {Math.round(g.priority * 100)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8ea8c4]">{g.description}</p>
                </div>
              ))}
            </div>

            {/* Recent Experiences */}
            <div>
              <span className="text-[10px] font-bold text-[#7d97b3] uppercase tracking-wider block mb-1.5">
                HISTÓRICO RECENTE DE EXPERIÊNCIAS
              </span>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {currentAgent.recentExperiences.map((exp, idx) => (
                  <div key={idx} className="p-2 bg-[#0e1828] border border-[#182a40] rounded-lg text-[11px] text-[#9fc0e0]">
                    <span className="text-[#00f2fe] mr-1">›</span> {exp}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Decision Evaluator Button */}
          <div className="pt-3 border-t border-[#182a40]">
            <button
              onClick={handleEvaluate}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#00f2fe] hover:bg-[#38f5fe] text-black font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)] cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Avaliar Decisão do Agente Agora</span>
            </button>
            {lastEval && (
              <p className="text-[10px] text-[#7c97b5] text-center mt-2">
                Última ação selecionada: <b className="text-[#00f2fe]">{lastEval.selectedActionName}</b>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
