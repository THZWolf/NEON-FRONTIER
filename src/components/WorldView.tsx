import React, { useState } from 'react';
import { WorldObservationEvent, EventType, EventOrigin } from '../types/neon';
import { Globe, PlusCircle, AlertTriangle, ShieldCheck, MapPin, Send } from 'lucide-react';

interface WorldViewProps {
  events: WorldObservationEvent[];
  onInjectEvent: (event: Omit<WorldObservationEvent, 'id' | 'timestamp' | 'isSimulatedTestData'>) => void;
}

export const WorldView: React.FC<WorldViewProps> = ({ events, onInjectEvent }) => {
  const [eventType, setEventType] = useState<EventType>('GUNFIRE_DETECTED');
  const [description, setDescription] = useState<string>('Disparos de fuzil registrados nas proximidades de Pillbox Hill');
  const [severity, setSeverity] = useState<number>(0.85);
  const [participants, setParticipants] = useState<string>('hostile_marcone, lspd_officer');
  const [posX, setPosX] = useState<number>(215);
  const [posY, setPosY] = useState<number>(-810);
  const [posZ, setPosZ] = useState<number>(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onInjectEvent({
      type: eventType,
      position: { x: posX, y: posY, z: posZ },
      sourceEntityId: 'observer_terminal',
      observedParticipants: participants
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
      origin: 'SIMULATED_TEST', // Strictly tagged as simulated data
      confidence: 0.95,
      severity,
      description: description.trim(),
    });
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Notice Banner */}
      <div className="p-3 bg-[#111926] border border-[#1f3752] rounded-xl flex items-center justify-between text-xs text-[#a2bedb]">
        <div className="flex items-center gap-2">
          <Globe size={15} className="text-[#00f2fe]" />
          <span>
            <b>OBSERVADOR DO MUNDO:</b> Receptor de eventos ambientais. Todos os dados abaixo são claramente classificados.
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#2b210c] text-[#ffd166] border border-[#6b501a]">
          ORIGEM: SIMULATED_TEST
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column: Manual Event Injector */}
        <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#182a40] pb-2">
            <PlusCircle size={15} className="text-[#00f2fe]" />
            <h3 className="text-xs font-bold text-white tracking-wider">
              INJETAR NOVO EVENTO DE TESTE
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] text-[#708dae] mb-1">Tipo de Evento:</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full bg-[#0e192a] border border-[#21354e] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
              >
                <option value="GUNFIRE_DETECTED">GUNFIRE_DETECTED (Tiroteio)</option>
                <option value="POLICE_SIREN_HEARD">POLICE_SIREN_HEARD (Sirene Policial)</option>
                <option value="DEAL_OFFERED">DEAL_OFFERED (Acordo Comercial)</option>
                <option value="BETRAYAL_OBSERVED">BETRAYAL_OBSERVED (Traição / Emboscada)</option>
                <option value="RESOURCE_OBTAINED">RESOURCE_OBTAINED (Recurso Coletado)</option>
                <option value="SUSPICIOUS_MOVEMENT">SUSPICIOUS_MOVEMENT (Movimentação Suspeita)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[#708dae] mb-1">Descrição do Evento:</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#0e192a] border border-[#21354e] rounded-lg p-2 text-xs text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[9px] text-[#708dae] mb-0.5">Coord X:</label>
                <input
                  type="number"
                  value={posX}
                  onChange={(e) => setPosX(Number(e.target.value))}
                  className="w-full bg-[#0e192a] border border-[#21354e] rounded px-2 py-1 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[9px] text-[#708dae] mb-0.5">Coord Y:</label>
                <input
                  type="number"
                  value={posY}
                  onChange={(e) => setPosY(Number(e.target.value))}
                  className="w-full bg-[#0e192a] border border-[#21354e] rounded px-2 py-1 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[9px] text-[#708dae] mb-0.5">Coord Z:</label>
                <input
                  type="number"
                  value={posZ}
                  onChange={(e) => setPosZ(Number(e.target.value))}
                  className="w-full bg-[#0e192a] border border-[#21354e] rounded px-2 py-1 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-[#708dae] mb-1">
                <span>Severidade / Gravidade:</span>
                <b className="text-white">{severity.toFixed(2)}</b>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={severity}
                onChange={(e) => setSeverity(parseFloat(e.target.value))}
                className="w-full accent-[#00f2fe]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#708dae] mb-1">Participantes Observados:</label>
              <input
                type="text"
                placeholder="Ex: hostile_ped, contact_dimitri"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className="w-full bg-[#0e192a] border border-[#21354e] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#00f2fe] hover:bg-[#38f5fe] text-black font-bold text-xs transition-all shadow-[0_0_12px_rgba(0,242,254,0.3)] cursor-pointer mt-2"
            >
              <Send size={12} />
              <span>Injetar Evento no Mundo</span>
            </button>
          </form>
        </div>

        {/* Right Column: Observation Log Feed */}
        <div className="lg:col-span-2 bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#182a40] pb-2">
            <h4 className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
              <span>HISTÓRICO DE EVENTOS OBSERVADOS</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#13273e] text-[#00f2fe]">
                {events.length} registrados
              </span>
            </h4>
            <span className="text-[10px] text-[#6a87a7]">Discriminação Clara de Origem</span>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {events.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5d7794] italic">
                Nenhum evento registrado ainda. Preencha o formulário ao lado para disparar.
              </div>
            ) : (
              events.map((evt, idx) => (
                <div
                  key={`${evt.id}_${idx}`}
                  className="p-3 bg-[#0e1828] border border-[#18293e] rounded-xl text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ffd166]/20 border border-[#ffd166]/40 text-[#ffd166]">
                        {evt.type}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2b210c] text-[#e6a23c] border border-[#6b501a]">
                        {evt.isSimulatedTestData ? '[DADOS SIMULADOS DE TESTE]' : '[CONFIRMADO GTA V]'}
                      </span>
                    </div>

                    <span className="text-[10px] text-[#718dae]">
                      Gravidade: <b className="text-white">{evt.severity.toFixed(2)}</b>
                    </span>
                  </div>

                  <p className="text-xs text-[#d2e4f7] leading-relaxed">{evt.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-[#6986a4] pt-1 border-t border-[#152336]">
                    <span className="flex items-center gap-1">
                      <MapPin size={10} /> {evt.position.x}, {evt.position.y}, {evt.position.z}
                    </span>
                    <span>Confiança: {Math.round(evt.confidence * 100)}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
