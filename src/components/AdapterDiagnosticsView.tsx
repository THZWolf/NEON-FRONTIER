import React from 'react';
import { AdapterStatus } from '../types/neon';
import {
  Radio,
  Power,
  ShieldAlert,
  Cpu,
  CheckCircle,
  AlertTriangle,
  Lock,
  Layers,
  FileCode,
} from 'lucide-react';

interface AdapterDiagnosticsViewProps {
  adapterStatus: AdapterStatus;
  adapterConnected: boolean;
  onToggleConnection: () => void;
}

export const AdapterDiagnosticsView: React.FC<AdapterDiagnosticsViewProps> = ({
  adapterStatus,
  adapterConnected,
  onToggleConnection,
}) => {
  const simulatedEntities = [
    { handle: 1001, type: 'PED', name: 'Player Ped (Michael/Franklin)', pos: '215.3, -810.2, 30.5', isAlive: true, isPlayer: true },
    { handle: 1002, type: 'PED', name: 'Civilian Witness', pos: '228.0, -815.0, 30.5', isAlive: true, isPlayer: false },
    { handle: 2001, type: 'VEHICLE', name: 'Buffalo S (Sports)', pos: '210.0, -805.0, 30.2', isAlive: true, isPlayer: false },
    { handle: 1003, type: 'PED', name: 'LSPD Patrol Officer', pos: '115.0, -745.0, 45.0', isAlive: true, isPlayer: false },
  ];

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Top Status Card */}
      <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/40 flex items-center justify-center text-[#00f2fe]">
            <Radio size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                ESTADO DO ADAPTADOR GTA V
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#2b210c] text-[#ffd166] border border-[#6b501a] font-bold">
                {adapterStatus}
              </span>
            </div>
            <p className="text-[11px] text-[#718dae]">
              Implementação ativa: <code>SimulatedGtaVAdapter</code> (Mock C++17 Test Rig)
            </p>
          </div>
        </div>

        <button
          onClick={onToggleConnection}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
            adapterConnected
              ? 'bg-[#331111] hover:bg-[#4a1717] border border-[#f56c6c] text-[#f56c6c]'
              : 'bg-[#122b1e] hover:bg-[#1a3d2b] border border-[#67c23a] text-[#67c23a]'
          }`}
        >
          <Power size={13} />
          <span>{adapterConnected ? 'Simular Queda de Conexão' : 'Restaurar Conexão Mock'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left Column: Compatibility Checklist & Warning */}
        <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5 border-b border-[#182a40] pb-2">
            <Cpu size={14} className="text-[#00f2fe]" /> AUDITORIA DE COMPATIBILIDADE DE INTEGRAÇÃO
          </h4>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-[#0e192a] border border-[#1a2e46] rounded-xl flex items-start gap-2.5">
              <CheckCircle size={15} className="text-[#67c23a] shrink-0 mt-0.5" />
              <div>
                <b className="text-white block">Interfaces C++17 Abstratas Compiladas</b>
                <p className="text-[10px] text-[#7a95b3] mt-0.5">
                  <code>IGtaVAdapter.hpp</code> padroniza consultas de entidades, eventos e despacho de tarefas.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#0e192a] border border-[#1a2e46] rounded-xl flex items-start gap-2.5">
              <CheckCircle size={15} className="text-[#67c23a] shrink-0 mt-0.5" />
              <div>
                <b className="text-white block">Isolamento de Threads via ScriptFiber</b>
                <p className="text-[10px] text-[#7a95b3] mt-0.5">
                  O motor de IA opera em thread assíncrona; chamadas nativas de GTA V são enfileiradas para a thread principal.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#0e192a] border border-[#1a2e46] rounded-xl flex items-start gap-2.5">
              <AlertTriangle size={15} className="text-[#e6a23c] shrink-0 mt-0.5" />
              <div>
                <b className="text-[#e6a23c] block">Estado GAME CONNECTED Bloqueado</b>
                <p className="text-[10px] text-[#7a95b3] mt-0.5">
                  Nenhum processo GTA V real está anexado ao navegador. O status permanecerá em <b>SIMULATION MODE</b> até
                  o plugin ASI nativo ser executado junto ao jogo no Windows.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#0e192a] border border-[#1a2e46] rounded-xl flex items-start gap-2.5">
              <Lock size={15} className="text-[#89a2bd] shrink-0 mt-0.5" />
              <div>
                <b className="text-white block">Hashes Nativos GTA V Enhanced Mapeados</b>
                <p className="text-[10px] text-[#7a95b3] mt-0.5">
                  Mapeamentos validados para <code>TASK_COMBAT_PED</code>, <code>TASK_SMART_FLEE_PED</code> e <code>SET_PED_ALERTNESS</code>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Accessible Entities */}
        <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#182a40] pb-2">
            <h4 className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-[#00f2fe]" /> ENTIDADES ACESSÍVEIS NA SIMULAÇÃO
            </h4>
            <span className="text-[10px] text-[#6d88a6]">
              {simulatedEntities.length} entidades no quadrante
            </span>
          </div>

          <div className="space-y-2">
            {simulatedEntities.map((ent) => (
              <div
                key={ent.handle}
                className="p-2.5 bg-[#0e192a] border border-[#1a2e46] rounded-xl text-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-1 rounded bg-[#12263d] border border-[#23456b] text-[#00f2fe] font-bold">
                      Handle #{ent.handle}
                    </span>
                    <b className="text-white">{ent.name}</b>
                    {ent.isPlayer && (
                      <span className="text-[8px] px-1 rounded bg-[#ff5fa2]/20 text-[#ff5fa2] border border-[#ff5fa2]/40">
                        PLAYER
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#6e89a6] block mt-0.5">
                    Posição: {ent.pos} · Tipo: {ent.type}
                  </span>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded bg-[#11261a] text-[#67c23a] border border-[#1f472e] font-bold">
                  {ent.isAlive ? 'VIVO' : 'MORTO'}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Technical Note */}
          <div className="p-3 bg-[#0a121e] border border-[#172538] rounded-xl text-[10px] text-[#6c86a3] space-y-1">
            <span className="text-[#00f2fe] font-bold block">Como conectar no GTA V real:</span>
            <p>
              1. Compile o projeto via Visual Studio 2022 usando o <code>CMakeLists.txt</code>.<br />
              2. Copie a biblioteca gerada para o diretório raiz do GTA V com o ScriptHookV.<br />
              3. O adaptador iniciará o heartbeat nativo e transmitirá o estado para a porta 3000.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
