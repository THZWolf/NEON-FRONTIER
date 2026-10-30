import React from 'react';
import { AgentModel, EpisodicMemory, WorldObservationEvent, AdapterStatus } from '../types/neon';
import {
  Activity,
  Users,
  Brain,
  Radio,
  Flame,
  Siren,
  Handshake,
  Skull,
  Zap,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface DashboardViewProps {
  agents: AgentModel[];
  memories: EpisodicMemory[];
  events: WorldObservationEvent[];
  adapterStatus: AdapterStatus;
  onInjectPresetEvent: (type: 'gunfire' | 'police' | 'deal' | 'betrayal') => void;
  onSelectAgent: (agentId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  agents,
  memories,
  events,
  adapterStatus,
  onInjectPresetEvent,
  onSelectAgent,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-4 font-mono select-none">
      {/* Simulation Warning Banner */}
      <div className="p-3 bg-[#131e13] border border-[#2e542e] rounded-xl flex items-center justify-between text-xs text-[#a3d9a5]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#67c23a] animate-pulse" />
          <span>
            <b>AMBIENTE CONTROLADO ATIVO:</b> Demonstração de agentes autônomos, memória persistente e decisões explicáveis.
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1f3a1f] text-[#bbf2bd] font-bold">
          {adapterStatus}
        </span>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-[#7d98b5] mb-1">
            <span>AGENTES ATIVOS</span>
            <Users size={14} className="text-[#00f2fe]" />
          </div>
          <div className="text-2xl font-bold text-white font-['Chakra_Petch']">
            {agents.length} <span className="text-xs text-[#6e85a0] font-normal font-mono">entidades</span>
          </div>
          <p className="text-[10px] text-[#5e7794] mt-1">Viper, Cipher, Jax inicializados</p>
        </div>

        <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-[#7d98b5] mb-1">
            <span>MEMÓRIAS EPISÓDICAS</span>
            <Brain size={14} className="text-[#ff5fa2]" />
          </div>
          <div className="text-2xl font-bold text-white font-['Chakra_Petch']">
            {memories.length} <span className="text-xs text-[#ff5fa2] font-normal font-mono">registros</span>
          </div>
          <p className="text-[10px] text-[#5e7794] mt-1">Decaimento temporal ativo (5%/h)</p>
        </div>

        <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-[#7d98b5] mb-1">
            <span>EVENTOS OBSERVADOS</span>
            <Activity size={14} className="text-[#ffd166]" />
          </div>
          <div className="text-2xl font-bold text-white font-['Chakra_Petch']">
            {events.length} <span className="text-xs text-[#ffd166] font-normal font-mono">telemetrias</span>
          </div>
          <p className="text-[10px] text-[#5e7794] mt-1">Classificados por origem & severidade</p>
        </div>

        <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-[#7d98b5] mb-1">
            <span>ADAPTADOR GTA V</span>
            <Radio size={14} className="text-[#00f2fe]" />
          </div>
          <div className="text-base font-bold text-[#ffd166] font-['Chakra_Petch'] mt-1">
            TEST RIG MOCK
          </div>
          <p className="text-[10px] text-[#5e7794] mt-1.5">Latência: ~0.4ms (In-Memory)</p>
        </div>
      </div>

      {/* Controlled Event Injection Testing Toolbar */}
      <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-[#00f2fe]" />
            <h3 className="text-xs font-bold text-white tracking-wider">
              INJETOR CONTROLADO DE EVENTOS SIMULADOS
            </h3>
          </div>
          <span className="text-[10px] text-[#7691ae] italic">
            Dispare um evento para observar a reação dos agentes e adaptação da memória
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            onClick={() => onInjectPresetEvent('gunfire')}
            className="flex items-center gap-2 p-2.5 bg-[#171c2b] hover:bg-[#2e1724] border border-[#27354d] hover:border-[#ff5fa2] rounded-xl text-left transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-[#ff5fa2]/10 text-[#ff5fa2] group-hover:scale-105 transition-transform">
              <Flame size={16} />
            </div>
            <div>
              <b className="text-xs text-white block">Tiroteio em Legion Sq.</b>
              <small className="text-[10px] text-[#ff5fa2]">Severidade: 0.95 (Combate)</small>
            </div>
          </button>

          <button
            onClick={() => onInjectPresetEvent('police')}
            className="flex items-center gap-2 p-2.5 bg-[#171c2b] hover:bg-[#12283e] border border-[#27354d] hover:border-[#00f2fe] rounded-xl text-left transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-[#00f2fe]/10 text-[#00f2fe] group-hover:scale-105 transition-transform">
              <Siren size={16} />
            </div>
            <div>
              <b className="text-xs text-white block">Sirenes em Pillbox Hill</b>
              <small className="text-[10px] text-[#00f2fe]">Severidade: 0.70 (Alerta)</small>
            </div>
          </button>

          <button
            onClick={() => onInjectPresetEvent('deal')}
            className="flex items-center gap-2 p-2.5 bg-[#171c2b] hover:bg-[#2d2716] border border-[#27354d] hover:border-[#ffd166] rounded-xl text-left transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-[#ffd166]/10 text-[#ffd166] group-hover:scale-105 transition-transform">
              <Handshake size={16} />
            </div>
            <div>
              <b className="text-xs text-white block">Acordo em Cypress Flats</b>
              <small className="text-[10px] text-[#ffd166]">Severidade: 0.60 (Social)</small>
            </div>
          </button>

          <button
            onClick={() => onInjectPresetEvent('betrayal')}
            className="flex items-center gap-2 p-2.5 bg-[#171c2b] hover:bg-[#331111] border border-[#27354d] hover:border-[#ff4444] rounded-xl text-left transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-[#ff4444]/10 text-[#ff4444] group-hover:scale-105 transition-transform">
              <Skull size={16} />
            </div>
            <div>
              <b className="text-xs text-white block">Traição por Marcone</b>
              <small className="text-[10px] text-[#ff4444]">Severidade: 0.85 (Hostil)</small>
            </div>
          </button>
        </div>
      </div>

      {/* Agents State Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {agents.map((agent) => {
          const alertPct = Math.round(agent.indicators.alertLevel * 100);
          const alertColor =
            alertPct > 60
              ? 'bg-[#ff5fa2] text-[#ff5fa2]'
              : alertPct > 25
              ? 'bg-[#ffd166] text-[#ffd166]'
              : 'bg-[#00f2fe] text-[#00f2fe]';

          return (
            <div
              key={agent.identity.id}
              onClick={() => {
                onSelectAgent(agent.identity.id);
                onNavigateTab('agents');
              }}
              className="bg-[#0b1422] border border-[#1d2d42] hover:border-[#00f2fe]/60 rounded-xl p-4 transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white font-['Chakra_Petch'] group-hover:text-[#00f2fe] transition-colors">
                      {agent.identity.alias}
                    </h4>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#142336] text-[#8faecf] border border-[#223954]">
                      {agent.identity.archetype}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#69829f] block font-mono">{agent.identity.id}</span>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#122236] border border-[#1f3854] text-[#8db3d9]">
                  {agent.behavior}
                </span>
              </div>

              {/* Alert Level Gauge */}
              <div className="my-3">
                <div className="flex items-center justify-between text-[10px] text-[#7c95b0] mb-1">
                  <span>Nível de Alerta Interno</span>
                  <span className="font-bold text-white">{alertPct}%</span>
                </div>
                <div className="h-1.5 bg-[#142030] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${alertColor.split(' ')[0]}`}
                    style={{ width: `${alertPct}%` }}
                  />
                </div>
              </div>

              {/* Current Action & Last Deciding Factor */}
              <div className="p-2.5 bg-[#0e192a] border border-[#192b42] rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#6d87a4]">Ação Atual:</span>
                  <b className="text-[#00f2fe]">{agent.currentAction}</b>
                </div>
                {agent.lastDecisionExplanation && (
                  <div className="text-[10px] text-[#8ca4c0] pt-1 border-t border-[#182a40]">
                    <span className="text-[#ff5fa2]">Motivo: </span>
                    <span>{agent.lastDecisionExplanation.primaryDecidingFactor}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-[#5c7591]">
                <span>Objetivos Ativos: {agent.activeGoals.length}</span>
                <span className="flex items-center gap-1 text-[#00f2fe] group-hover:translate-x-0.5 transition-transform">
                  Ver Agente <ArrowUpRight size={11} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Feed & Decision Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Recent Episodic Memories */}
        <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
              <Brain size={14} className="text-[#ff5fa2]" /> MEMÓRIAS EPISÓDICAS RECENTES
            </h4>
            <button
              onClick={() => onNavigateTab('memory')}
              className="text-[10px] text-[#00f2fe] hover:underline cursor-pointer"
            >
              Ver todas ({memories.length})
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {memories.slice(0, 4).map((m, idx) => (
              <div key={`${m.id}_${idx}`} className="p-2.5 bg-[#0e1828] border border-[#182a40] rounded-lg text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-1 rounded bg-[#ff5fa2]/20 text-[#ff5fa2] border border-[#ff5fa2]/40">
                      {m.eventType}
                    </span>
                    <span className="text-[10px] text-[#7b94ad]">Agente: {m.agentId}</span>
                  </div>
                  <span className="text-[10px] text-[#ffd166]">Imp: {m.importanceScore.toFixed(2)}</span>
                </div>
                <p className="text-[11px] text-[#b6cce3] leading-relaxed">{m.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent World Observations */}
        <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-[#ffd166]" /> TELEMETRIA DO OBSERVADOR DO MUNDO
            </h4>
            <button
              onClick={() => onNavigateTab('world')}
              className="text-[10px] text-[#00f2fe] hover:underline cursor-pointer"
            >
              Ver eventos ({events.length})
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {events.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#59728e] italic">
                Nenhum evento registrado ainda. Dispare um evento controlado acima.
              </div>
            ) : (
              events.slice(0, 4).map((e, idx) => (
                <div key={`${e.id}_${idx}`} className="p-2.5 bg-[#0e1828] border border-[#182a40] rounded-lg text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] px-1 rounded bg-[#ffd166]/20 text-[#ffd166] border border-[#ffd166]/40">
                      {e.type}
                    </span>
                    <span className="text-[9px] text-[#e6a23c]">
                      {e.isSimulatedTestData ? '[DADOS SIMULADOS DE TESTE]' : '[CONFIRMADO]'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#b6cce3]">{e.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
