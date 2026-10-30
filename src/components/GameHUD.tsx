import React, { useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Pause,
  Activity,
  Zap,
  Coins,
  Compass,
  Crosshair,
  Shield,
  Heart,
  Users,
  Sun,
  Moon,
  Sunset,
  Radio,
  Lightbulb,
  Gauge,
  Flame,
} from 'lucide-react';
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
  onOpenCharacterSwitch: () => void;
  onCycleTimeOfDay: () => void;
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
  onOpenCharacterSwitch,
  onCycleTimeOfDay,
}) => {
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);

  // Render Real-Time GTA-Style Radar Minimap on 2D Canvas
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;
    const scale = 1.4; // pixels per world meter

    // 1. Clear background
    ctx.fillStyle = '#060c18ee';
    ctx.fillRect(0, 0, w, h);

    // 2. Draw district road grid lines
    ctx.strokeStyle = '#162840';
    ctx.lineWidth = 12;

    const playerX = diagnostics.playerPos.x;
    const playerZ = diagnostics.playerPos.z;

    // Cross streets relative to player
    const relPlazaX = centerX - playerX * scale;
    const relPlazaY = centerY - playerZ * scale;

    // Central cross roads
    ctx.beginPath();
    ctx.moveTo(0, relPlazaY);
    ctx.lineTo(w, relPlazaY);
    ctx.moveTo(relPlazaX, 0);
    ctx.lineTo(relPlazaX, h);
    ctx.stroke();

    // Central Plaza circle
    ctx.strokeStyle = '#00f2fe33';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(relPlazaX, relPlazaY, 14 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Draw Harbor Water line at z = -60
    const harborY = centerY - (-60 - playerZ) * scale;
    ctx.fillStyle = '#03182b88';
    ctx.fillRect(0, harborY, w, 40 * scale);

    // 4. Venue Radar Blips
    const blips = [
      { name: 'GARAGE', x: 26, z: -14, color: '#00f2fe' },
      { name: 'CLUB', x: -26, z: -14, color: '#ff0077' },
      { name: 'GUNS', x: 26, z: 14, color: '#ff3344' },
      { name: 'HEIST', x: -26, z: 14, color: '#ffaa00' },
      { name: 'ARCADE', x: 0, z: 30, color: '#39ff14' },
      { name: 'YACHT', x: 0, z: -45, color: '#00d2fe' },
    ];

    for (const b of blips) {
      const bx = centerX + (b.x - playerX) * scale;
      const by = centerY + (b.z - playerZ) * scale;

      // Only draw if within radar boundary
      if (bx >= 4 && bx <= w - 4 && by >= 4 && by <= h - 4) {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // 5. Police pursuit blip (if wanted level > 0)
    if (diagnostics.wantedStars > 0) {
      const isRed = Math.floor(performance.now() / 250) % 2 === 0;
      ctx.fillStyle = isRed ? '#ff0022' : '#0044ff';
      const copAngle = performance.now() * 0.002;
      const copX = centerX + Math.cos(copAngle) * 35;
      const copY = centerY + Math.sin(copAngle) * 35;
      ctx.beginPath();
      ctx.arc(copX, copY, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Player heading arrow at center
    ctx.fillStyle = diagnostics.character.themeColor || '#00f2fe';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 6);
    ctx.lineTo(centerX - 5, centerY + 5);
    ctx.lineTo(centerX, centerY + 2);
    ctx.lineTo(centerX + 5, centerY + 5);
    ctx.closePath();
    ctx.fill();

    // Radar border ring
    ctx.strokeStyle = '#1d3b63';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);
  }, [diagnostics.playerPos, diagnostics.character, diagnostics.wantedStars]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 select-none font-mono">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between">
        {/* Operative Profile Badge & Character Switcher Trigger */}
        <div
          onClick={onOpenCharacterSwitch}
          className="bg-[#070e1acc] border border-[#1b2f4a] hover:border-[#00f2fe] backdrop-blur-md rounded-2xl p-2.5 shadow-lg pointer-events-auto cursor-pointer transition-all flex items-center gap-3 group"
          title="Clique para alternar operativo ativo (Tab)"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-black shadow-md"
            style={{ backgroundColor: diagnostics.character.themeColor }}
          >
            {diagnostics.character.codename.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white group-hover:text-[#00f2fe] transition-colors">
                {diagnostics.character.name}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40">
                [TAB] TROCAR
              </span>
            </div>
            <div className="text-[10px] text-[#7090b8]">{diagnostics.character.role}</div>
          </div>
        </div>

        {/* Center: Wanted Stars & District Banner */}
        <div className="flex flex-col items-center gap-1.5">
          {/* 5-Star Wanted Level Indicator */}
          <div className="flex items-center gap-1 bg-[#070e1acc] border border-[#1b2f4a] backdrop-blur-md rounded-xl px-3 py-1 shadow-lg">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = star <= diagnostics.wantedStars;
              const isBlinking = diagnostics.wantedStars >= 3;
              return (
                <span
                  key={star}
                  className={`text-sm transition-all ${
                    isActive
                      ? isBlinking
                        ? 'text-[#ff0033] animate-pulse drop-shadow-[0_0_8px_#ff0033]'
                        : 'text-[#ffd166] drop-shadow-[0_0_6px_#ffd166]'
                      : 'text-[#2a3c54]'
                  }`}
                >
                  ★
                </span>
              );
            })}
            {diagnostics.wantedStars > 0 && (
              <span className="text-[9px] font-bold text-[#ff3344] ml-1 animate-pulse">
                PROCURADO NÍVEL {diagnostics.wantedStars}
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-[#070e1acc] border border-[#1b2f4a] backdrop-blur-md rounded-xl px-3 py-1 text-[10px] text-[#7a9abf]">
            <Compass size={12} className="text-[#00f2fe]" />
            <span>NEON FRONTIER · NEXUS & MARINA BAY</span>
          </div>
        </div>

        {/* Top Right: Time of Day, Sound, Credits, Diagnostics, Pause */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Time of Day Cycle */}
          <button
            onClick={onCycleTimeOfDay}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0d1a2d] hover:bg-[#162c4a] border border-[#233d61] text-xs font-bold text-[#ffd166] transition-colors cursor-pointer"
            title="Alternar Horário do Dia (Noite / Pôr do Sol / Dia)"
          >
            {diagnostics.timeOfDay === 'NIGHT' && <Moon size={14} className="text-[#00f2fe]" />}
            {diagnostics.timeOfDay === 'SUNSET' && <Sunset size={14} className="text-[#ffaa00]" />}
            {diagnostics.timeOfDay === 'DAY' && <Sun size={14} className="text-[#ffd166]" />}
            <span className="text-[10px] hidden md:inline">{diagnostics.timeOfDay}</span>
          </button>

          {/* Credits */}
          <div className="bg-[#070e1acc] border border-[#1b2f4a] backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs text-[#ffd166]">
            <Coins size={13} />
            <span className="font-bold">{diagnostics.credits}</span>
          </div>

          {/* Audio Mute */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-[#0d1a2d] hover:bg-[#162c4a] border border-[#233d61] text-[#9fc2e8] hover:text-[#00f2fe] transition-colors cursor-pointer"
            title={soundEnabled ? 'Silenciar áudio' : 'Ativar áudio'}
          >
            {soundEnabled ? <Volume2 size={14} className="text-[#00f2fe]" /> : <VolumeX size={14} />}
          </button>

          {/* Diagnostics F3 */}
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

          {/* Pause */}
          <button
            onClick={onPause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1a2d] hover:bg-[#162c4a] border border-[#233d61] hover:border-[#00f2fe] text-xs font-bold text-white transition-colors cursor-pointer"
          >
            <Pause size={13} className="text-[#00f2fe]" />
            <span>Esc</span>
          </button>
        </div>
      </div>

      {/* Screen Center Subtle Reticle / Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-60">
        <div className="w-3.5 h-3.5 border border-[#00f2fe] rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-[#00f2fe] rounded-full" />
        </div>
      </div>

      {/* Pointer Lock Hint */}
      {!isPointerLocked && (
        <div
          onClick={onRequestPointerLock}
          className="absolute top-20 left-1/2 -translate-x-1/2 bg-[#081324ee] border border-[#00f2fe]/60 rounded-full px-4 py-1.5 text-xs text-[#00f2fe] shadow-[0_0_15px_rgba(0,242,254,0.3)] pointer-events-auto cursor-pointer flex items-center gap-2 hover:bg-[#10243e] transition-colors animate-bounce"
        >
          <Crosshair size={13} />
          <span>Clique na tela para controlar a câmera em 360°</span>
        </div>
      )}

      {/* Bottom Area: GTA Minimap (Left), Contextual Prompt (Center), Weapon HUD (Right) */}
      <div className="flex items-end justify-between gap-4">
        {/* Left: GTA Radar & Status Bars */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {/* Radar Canvas */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-[#1c385e] shadow-2xl bg-[#081220]">
            <canvas ref={radarCanvasRef} width={150} height={110} className="block w-[150px] h-[110px]" />
          </div>

          {/* GTA Health & Armor Bars */}
          <div className="w-[150px] space-y-1 bg-[#070e1acc] border border-[#1b2f4a] p-1.5 rounded-xl backdrop-blur-md">
            {/* Health Bar (Green) */}
            <div className="flex items-center gap-1.5">
              <Heart size={10} className="text-[#39ff14]" />
              <div className="flex-1 h-1.5 bg-[#142614] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#20cc00] to-[#39ff14] transition-all duration-150"
                  style={{ width: `${diagnostics.health}%` }}
                />
              </div>
              <span className="text-[8px] font-bold text-white">{Math.round(diagnostics.health)}</span>
            </div>

            {/* Armor Bar (Cyan) */}
            <div className="flex items-center gap-1.5">
              <Shield size={10} className="text-[#00f2fe]" />
              <div className="flex-1 h-1.5 bg-[#102436] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0099ff] to-[#00f2fe] transition-all duration-150"
                  style={{ width: `${diagnostics.armor}%` }}
                />
              </div>
              <span className="text-[8px] font-bold text-white">{Math.round(diagnostics.armor)}</span>
            </div>

            {/* Stamina / Nitro Bar (Yellow) */}
            <div className="flex items-center gap-1.5">
              <Zap size={10} className="text-[#ffd166]" />
              <div className="flex-1 h-1.5 bg-[#262010] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ffaa00] to-[#ffd166] transition-all duration-150"
                  style={{ width: `${diagnostics.isDriving ? diagnostics.nitro : diagnostics.stamina}%` }}
                />
              </div>
              <span className="text-[8px] font-bold text-white">
                {diagnostics.isDriving ? diagnostics.nitro : diagnostics.stamina}%
              </span>
            </div>
          </div>
        </div>

        {/* Center: Contextual Floating Banner & Driving HUD */}
        <div className="flex-1 flex flex-col items-center gap-2 max-w-xl">
          {/* In-Vehicle Speedometer HUD */}
          {diagnostics.isDriving && (
            <div className="bg-[#081528f0] border-2 border-[#00f2fe] rounded-2xl px-6 py-2.5 shadow-[0_0_25px_rgba(0,242,254,0.4)] pointer-events-auto flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-black text-white tracking-wider flex items-baseline justify-center gap-1">
                  {diagnostics.speedKmh}
                  <span className="text-xs font-bold text-[#00f2fe]">KM/H</span>
                </div>
                <div className="text-[9px] text-[#7090b8]">VELOCIDADE ATUAL</div>
              </div>

              <div className="h-8 w-px bg-[#1c385e]" />

              <div className="flex items-center gap-3 text-xs text-[#9fc2e8]">
                <div className="flex items-center gap-1 text-[#ffd166]">
                  <Flame size={14} />
                  <span>NITRO: {diagnostics.nitro}%</span>
                </div>
                <div className="flex items-center gap-1 text-[#00f2fe]">
                  <Radio size={14} />
                  <span>{diagnostics.radioStation}</span>
                </div>
              </div>
            </div>
          )}

          {/* Contextual Interaction Prompt Banner */}
          {interactionPrompt && (
            <div className="bg-[#081528f0] border-2 border-[#00f2fe] rounded-2xl px-5 py-2.5 shadow-[0_0_20px_rgba(0,242,254,0.4)] pointer-events-auto animate-pulse flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00f2fe]" />
              <b className="text-xs sm:text-sm font-bold text-white tracking-wide">
                {interactionPrompt}
              </b>
            </div>
          )}
        </div>

        {/* Right: Weapon & Ammo HUD */}
        <div className="bg-[#070e1acc] border border-[#1b2f4a] backdrop-blur-md rounded-2xl p-3 shadow-lg pointer-events-auto flex flex-col items-end gap-1.5 min-w-[170px]">
          <div className="text-[10px] text-[#7090b8] flex items-center gap-1">
            <Crosshair size={11} className="text-[#00f2fe]" />
            <span>ARMA ATIVA</span>
          </div>
          <div className="text-sm font-black text-white">{diagnostics.activeWeapon.name}</div>

          {diagnostics.activeWeapon.type !== 'MELEE' ? (
            <div className="text-xl font-black text-[#00f2fe] flex items-baseline gap-1">
              {diagnostics.activeWeapon.currentMag}
              <span className="text-xs text-[#7090b8]">/ {diagnostics.activeWeapon.reserveAmmo}</span>
            </div>
          ) : (
            <div className="text-xs font-bold text-[#39ff14]">CORPO-A-CORPO</div>
          )}

          {/* Hotkey Weapon selector */}
          <div className="flex gap-1 mt-1 text-[9px]">
            <span className="px-1.5 py-0.5 rounded bg-[#10243d] text-[#00f2fe] border border-[#1c385e]">
              [1] FIST
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#10243d] text-[#00f2fe] border border-[#1c385e]">
              [2] RIFLE
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#10243d] text-[#00f2fe] border border-[#1c385e]">
              [3] HEAVY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
