import React, { useState } from 'react';
import { EpisodicMemory, EventType, EventOrigin } from '../types/neon';
import { Brain, Filter, Search, Clock, MapPin, Users, Award, ShieldCheck } from 'lucide-react';

interface MemoryViewProps {
  memories: EpisodicMemory[];
  agents: { id: string; alias: string }[];
}

export const MemoryView: React.FC<MemoryViewProps> = ({ memories, agents }) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('ALL');
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [minImportance, setMinImportance] = useState<number>(0.0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredMemories = memories.filter((m) => {
    if (selectedAgent !== 'ALL' && m.agentId !== selectedAgent) return false;
    if (selectedEventType !== 'ALL' && m.eventType !== selectedEventType) return false;
    if (m.importanceScore < minImportance) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSummary = m.summary.toLowerCase().includes(q);
      const matchParticipant = m.participants.some((p) => p.toLowerCase().includes(q));
      if (!matchSummary && !matchParticipant) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Header and Filter Toolbar */}
      <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#182a40] pb-3">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-[#ff5fa2]" />
            <h3 className="text-sm font-bold text-white tracking-wider">
              CONSULTA DE MEMÓRIA EPISÓDICA PERSISTENTE
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#1f1d2e] border border-[#3e345b] text-[#ff5fa2]">
              {filteredMemories.length} de {memories.length} memórias
            </span>
          </div>

          <div className="text-[10px] text-[#6b85a3]">
            Decaimento temporal contínuo: <b className="text-[#00f2fe]">5% / hora</b>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Agent Filter */}
          <div>
            <label className="block text-[10px] text-[#718dae] mb-1">Filtrar por Agente:</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full bg-[#0e192a] border border-[#21354e] rounded-lg px-2.5 py-1.5 text-xs text-[#d2e4f7] outline-none"
            >
              <option value="ALL">Todos os Agentes</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.alias} ({a.id})
                </option>
              ))}
            </select>
          </div>

          {/* Event Type Filter */}
          <div>
            <label className="block text-[10px] text-[#718dae] mb-1">Tipo de Evento:</label>
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="w-full bg-[#0e192a] border border-[#21354e] rounded-lg px-2.5 py-1.5 text-xs text-[#d2e4f7] outline-none"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="GUNFIRE_DETECTED">Tiroteio Detectado</option>
              <option value="POLICE_SIREN_HEARD">Sirene Policial</option>
              <option value="DEAL_OFFERED">Acordo Proposto</option>
              <option value="BETRAYAL_OBSERVED">Traição Observada</option>
              <option value="SAFEHOUSE_ENTERED">Entrada em Safehouse</option>
            </select>
          </div>

          {/* Importance Slider */}
          <div>
            <div className="flex justify-between text-[10px] text-[#718dae] mb-1">
              <span>Importância Mínima:</span>
              <b className="text-white">{minImportance.toFixed(2)}</b>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.9"
              step="0.05"
              value={minImportance}
              onChange={(e) => setMinImportance(parseFloat(e.target.value))}
              className="w-full accent-[#00f2fe]"
            />
          </div>

          {/* Text Search */}
          <div>
            <label className="block text-[10px] text-[#718dae] mb-1">Buscar por Palavra ou Sujeito:</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: Legion, Marcone, Dimitri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0e192a] border border-[#21354e] rounded-lg pl-7 pr-2.5 py-1.5 text-xs text-[#d2e4f7] outline-none"
              />
              <Search size={12} className="absolute left-2.5 top-2.5 text-[#5e7896]" />
            </div>
          </div>
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredMemories.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-xs text-[#5e7896] bg-[#0b1422] border border-[#1d2d42] rounded-xl italic">
            Nenhuma memória episódica corresponde aos filtros selecionados.
          </div>
        ) : (
          filteredMemories.map((m, idx) => {
            const timeAgo = Math.max(1, Math.round((Date.now() - m.timestamp) / 60000));
            return (
              <div
                key={`${m.id}_${idx}`}
                className="bg-[#0b1422] border border-[#1d2d42] hover:border-[#ff5fa2]/50 rounded-xl p-3.5 space-y-2.5 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#ff5fa2]/20 border border-[#ff5fa2]/40 text-[#ff5fa2]">
                      {m.eventType}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#112338] border border-[#213b5a] text-[#86aee0]">
                      Agente: {m.agentId}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e2a1e] text-[#67c23a] border border-[#2e4d2e]">
                      {m.origin}
                    </span>
                  </div>

                  <div className="text-right text-[10px] text-[#6984a3] flex items-center gap-1">
                    <Clock size={11} /> {timeAgo} min atrás
                  </div>
                </div>

                <p className="text-xs text-[#d2e5f8] leading-relaxed bg-[#0e192a] border border-[#18293e] rounded-lg p-2.5">
                  {m.summary}
                </p>

                {/* Metadata details */}
                <div className="grid grid-cols-3 gap-2 text-[10px] text-[#7a95b3] pt-1 border-t border-[#16273c]">
                  <div>
                    <span className="block text-[#57708c]">Importância:</span>
                    <b className="text-[#ffd166]">{m.importanceScore.toFixed(2)} / 1.0</b>
                  </div>
                  <div>
                    <span className="block text-[#57708c]">Confiança:</span>
                    <b className="text-[#00f2fe]">{Math.round(m.confidence * 100)}%</b>
                  </div>
                  <div>
                    <span className="block text-[#57708c]">Localização (3D):</span>
                    <b className="text-[#a1bce0]">
                      {m.location.x.toFixed(0)}, {m.location.y.toFixed(0)}, {m.location.z.toFixed(0)}
                    </b>
                  </div>
                </div>

                {/* Participants tags */}
                {m.participants.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-[#708aa8]">
                    <Users size={11} className="text-[#8ba7c9]" />
                    <span>Participantes vinculados:</span>
                    <div className="flex flex-wrap gap-1">
                      {m.participants.map((p, i) => (
                        <span key={i} className="px-1.5 py-0.2 rounded bg-[#16263b] text-[#9fc4ed]">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
