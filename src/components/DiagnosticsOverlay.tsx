import React from 'react';
import { EngineDiagnostics } from '../game3d/core/Engine';
import { NPCInstance } from '../game3d/npc/NPCManager';
import { Activity, X, Eye, Cpu, Compass, Box } from 'lucide-react';

interface DiagnosticsOverlayProps {
  diagnostics: EngineDiagnostics;
  npcs: NPCInstance[];
  isSoftwareGl: boolean;
  onClose: () => void;
}

export const DiagnosticsOverlay: React.FC<DiagnosticsOverlayProps> = ({
  diagnostics,
  npcs,
  isSoftwareGl,
  onClose,
}) => {
  return (
    <div className="absolute top-16 left-4 z-40 w-80 max-w-full bg-[#050c18ee] border border-[#00f2fe]/40 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs font-mono text-slate-200 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1b3456] pb-2 mb-2.5">
        <div className="flex items-center gap-2 text-[#00f2fe] font-bold">
          <Activity size={15} />
          <span>DIAGNÓSTICO 3D (F3)</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#162742] cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {/* Render Telemetry */}
      <div className="space-y-1.5 mb-3 text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-400">FPS / Taxa:</span>
          <span
            className={`font-bold ${
              diagnostics.fps >= 50
                ? 'text-emerald-400'
                : diagnostics.fps >= 30
                ? 'text-amber-400'
                : 'text-red-400'
            }`}
          >
            {diagnostics.fps} FPS
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">WebGL Pipeline:</span>
          <span className={isSoftwareGl ? 'text-amber-400' : 'text-cyan-400'}>
            {isSoftwareGl ? 'Software Fallback (Safe)' : 'Hardware PBR'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Draw Calls:</span>
          <span className="text-slate-200">{diagnostics.drawCalls}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Triângulos:</span>
          <span className="text-slate-200">{diagnostics.triangles.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Posição Jogador (X, Y, Z):</span>
          <span className="text-[#00f2fe] font-bold">
            [{diagnostics.playerPos.x}, {diagnostics.playerPos.y}, {diagnostics.playerPos.z}]
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Estamina:</span>
          <span className="text-emerald-400">{diagnostics.stamina}%</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Colisão / AABB:</span>
          <span className="text-cyan-300">Ativa (Sliding Resolution)</span>
        </div>
      </div>

      {/* 5 NPCs State Breakdown */}
      <div className="border-t border-[#1b3456] pt-2">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1 font-bold">
          <Cpu size={12} className="text-[#00f2fe]" /> Estados dos Agentes Autônomos ({npcs.length})
        </div>
        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
          {npcs.map((npc) => (
            <div
              key={npc.data.id}
              className="p-1.5 rounded bg-[#091527] border border-[#162f52] flex items-center justify-between text-[10px]"
            >
              <div>
                <span className="font-bold text-white">{npc.data.name}</span>
                <span className="text-slate-400 ml-1">({npc.data.role.slice(0, 10)})</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-1 rounded text-[9px] font-semibold ${
                    npc.state === 'Interact'
                      ? 'bg-amber-900/60 text-amber-300'
                      : npc.state === 'Wander'
                      ? 'bg-cyan-950 text-cyan-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {npc.state}
                </span>
                <span className="text-slate-400">♥{npc.trustLevel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
