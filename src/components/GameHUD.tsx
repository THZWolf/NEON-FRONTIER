import React from 'react';
import { Volume2, VolumeX, Pause, Activity, Zap, Coins, Compass, Crosshair } from 'lucide-react';
import { EngineDiagnostics } from '../game3d/core/Engine';

interface GameHUDProps {
  diagnostics: EngineDiagnostics;
  interactionPrompt: string | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  onToggleDiagnostics: () => void;
  showDiagnostics: boolean;
  isPointerLocked: boolean;
  onRequestPointerLock: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  diagnostics,
  interactionPrompt,
  soundEnabled,
  onToggleSound,
  onPause,
  onToggleDiagnostics,
  showDiagnostics,
  isPointerLocked,
  onRequestPointerLock,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 select-none font-mono">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between">
        {/* Title & Coordinates */}
        <div className="bg-[#070e1acc] border border-[#1b2f4a] backdrop-blur-md rounded-xl p-2.5 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-widest text-white font-['Chakra_Petch']">
              NEON <span className="text-[#00f2fe]">FRONTIER 3D</span>
            </h1>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#10243b] text-[#00f2fe] border border-[#1d3d63]">
              NEXUS DISTRICT
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[#7693b4] mt-1">
            <span>POS: {diagnostics.playerPos.x}, {diagnostics.playerPos.z}</span>
            <span>NPCs: {diagnostics.npcCount}</span>
            <span>FPS: {diagnostics.fps}</span>
          </div>
        </div>

        {/* Center Compass / Mini-radar banner */}
        <div className="hidden sm:flex items-center gap-2 bg-[#070e1acc] border border-[#1b2f4a] backdrop-blur-md rounded-xl px-4 py-1.5 shadow-lg">
          <Compass size={13} className="text-[#00f2fe]" />
          <span className="text-[10px] text-[#9fc2e8] tracking-widest">
            PRAÇA CENTRAL [0, 0] · 5 CIDADÃOS ACTIVOS
          </span>
        </div>

        {/* Top Right Controls & Stamina */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Stamina Meter */}
          <div className="bg-[#070e1acc] border border-[#1b2f4a] backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Zap size={13} className="text-[#00f2fe]" />
            <div className="w-16 h-1.5 bg-[#142338] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00d2fe] to-[#00f2fe] transition-all duration-150"
                style={{ width: `${diagnostics.stamina}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-white">{diagnostics.stamina}%</span>
          </div>

          {/* Credits */}
          <div className="bg-[#070e1acc] border border-[#1b2f4a] backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs text-[#ffd166]">
            <Coins size={13} />
            <span className="font-bold">{diagnostics.credits}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-[#0d1a2d] hover:bg-[#162c4a] border border-[#233d61] text-[#9fc2e8] hover:text-[#00f2fe] transition-colors cursor-pointer"
            title={soundEnabled ? 'Silenciar áudio' : 'Ativar áudio'}
          >
            {soundEnabled ? <Volume2 size={14} className="text-[#00f2fe]" /> : <VolumeX size={14} />}
          </button>

          {/* Diagnostic Toggle F3 */}
          <button
            onClick={onToggleDiagnostics}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              showDiagnostics
                ? 'bg-[#15344f] border-[#00f2fe] text-[#00f2fe]'
                : 'bg-[#0d1a2d] hover:bg-[#162c4a] border-[#233d61] text-[#9fc2e8]'
            }`}
            title="Diagnóstico 3D (F3)"
          >
            <Activity size={14} />
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1a2d] hover:bg-[#162c4a] border border-[#233d61] hover:border-[#00f2fe] text-xs font-bold text-white transition-colors cursor-pointer"
          >
            <Pause size={13} className="text-[#00f2fe]" />
            <span>Esc</span>
          </button>
        </div>
      </div>

      {/* Screen Center Subtle Reticle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
        <div className="w-2.5 h-2.5 border border-[#00f2fe] rounded-full" />
      </div>

      {/* Pointer Lock Hint when free-look is inactive */}
      {!isPointerLocked && (
        <div
          onClick={onRequestPointerLock}
          className="absolute top-20 left-1/2 -translate-x-1/2 bg-[#081324ee] border border-[#00f2fe]/60 rounded-full px-4 py-1.5 text-xs text-[#00f2fe] shadow-[0_0_15px_rgba(0,242,254,0.3)] pointer-events-auto cursor-pointer flex items-center gap-2 hover:bg-[#10243e] transition-colors animate-bounce"
        >
          <Crosshair size={13} />
          <span>Clique na tela para travar o mouse e olhar em 360°</span>
        </div>
      )}

      {/* Bottom Area: Contextual Interaction Banner & Cheatsheet */}
      <div className="flex flex-col sm:flex-row items-end justify-between gap-3">
        {/* Interaction Prompt Floating Banner */}
        <div className="w-full sm:w-auto">
          {interactionPrompt && (
            <div className="bg-[#081528f0] border-2 border-[#00f2fe] rounded-2xl px-5 py-2.5 shadow-[0_0_20px_rgba(0,242,254,0.4)] pointer-events-auto animate-pulse flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00f2fe]" />
              <b className="text-xs sm:text-sm font-bold text-white tracking-wide">
                {interactionPrompt}
              </b>
            </div>
          )}
        </div>

        {/* Minimal Controls Cheatsheet */}
        <div className="bg-[#070e1acc] border border-[#1b2f4a] backdrop-blur-md rounded-xl p-2.5 text-[10px] text-[#7a96b5] pointer-events-auto space-y-0.5">
          <div><b className="text-[#00f2fe]">WASD</b> : Mover explorador</div>
          <div><b className="text-[#00f2fe]">Shift</b> : Correr (consome energia)</div>
          <div><b className="text-[#00f2fe]">Espaço</b> : Pular</div>
          <div><b className="text-[#00f2fe]">Mouse</b> : Olhar em terceira pessoa</div>
          <div><b className="text-[#00f2fe]">E</b> : Interagir com NPCs / Terminais</div>
        </div>
      </div>
    </div>
  );
};
