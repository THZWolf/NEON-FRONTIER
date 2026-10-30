import React, { useState } from 'react';
import { Wrench, Zap, Gauge, Palette, Shield, X, Check, Disc } from 'lucide-react';
import { Vehicle } from '../game3d/vehicles/Vehicle';
import { gameAudio } from '../game3d/core/Audio';

interface AutoModModalProps {
  vehicle: Vehicle | null;
  playerCredits: number;
  onUpdateCredits: (newAmount: number) => void;
  onClose: () => void;
}

const PAINT_COLORS = [
  { name: 'Neon Cyan', hex: 0x00f2fe, class: 'bg-[#00f2fe]' },
  { name: 'Cyber Pink', hex: 0xff0077, class: 'bg-[#ff0077]' },
  { name: 'Sunset Amber', hex: 0xffaa00, class: 'bg-[#ffaa00]' },
  { name: 'Acid Lime', hex: 0x39ff14, class: 'bg-[#39ff14]' },
  { name: 'Matte Obsidian', hex: 0x111622, class: 'bg-[#111622]' },
  { name: 'Ultra Violet', hex: 0x9d00ff, class: 'bg-[#9d00ff]' },
];

const UNDERGLOW_COLORS = [
  { name: 'Cyan Pulse', hex: 0x00f2fe, class: 'bg-[#00f2fe]' },
  { name: 'Magenta Glow', hex: 0xff00aa, class: 'bg-[#ff00aa]' },
  { name: 'Solar Flare', hex: 0xffcc00, class: 'bg-[#ffcc00]' },
  { name: 'Toxic Green', hex: 0x00ff88, class: 'bg-[#00ff88]' },
  { name: 'Electric Blue', hex: 0x0066ff, class: 'bg-[#0066ff]' },
];

export const AutoModModal: React.FC<AutoModModalProps> = ({
  vehicle,
  playerCredits,
  onUpdateCredits,
  onClose,
}) => {
  const [selectedPaint, setSelectedPaint] = useState<number>(vehicle?.customization.paintColor ?? 0x00f2fe);
  const [selectedUnderglow, setSelectedUnderglow] = useState<number>(vehicle?.customization.underglowColor ?? 0x00f2fe);
  const [turboLevel, setTurboLevel] = useState<number>(vehicle?.customization.turboLevel ?? 2);
  const [activeTab, setActiveTab] = useState<'PAINT' | 'PERFORMANCE' | 'TELEMETRY'>('PAINT');

  const handleApplyPaint = (colorHex: number) => {
    setSelectedPaint(colorHex);
    if (vehicle) {
      vehicle.setPaintColor(colorHex);
      gameAudio.playInteract();
    }
  };

  const handleApplyUnderglow = (colorHex: number) => {
    setSelectedUnderglow(colorHex);
    if (vehicle) {
      vehicle.setUnderglowColor(colorHex);
      gameAudio.playInteract();
    }
  };

  const handleUpgradeTurbo = (level: number) => {
    const cost = level * 30;
    if (playerCredits >= cost) {
      onUpdateCredits(playerCredits - cost);
      setTurboLevel(level);
      if (vehicle) {
        vehicle.customization.turboLevel = level;
      }
      gameAudio.playNitroBoost();
    }
  };

  const handleRevEngine = () => {
    gameAudio.playNitroBoost();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono select-none">
      <div className="relative w-full max-w-4xl bg-[#081220] border-2 border-[#00f2fe] rounded-2xl shadow-[0_0_40px_rgba(0,242,254,0.35)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#182d49] bg-[#0c1a2e]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/40 text-[#00f2fe]">
              <Wrench size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                AUTO-MOD <span className="text-[#00f2fe]">31</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40">
                  OFICINA DE TUNING CYBER
                </span>
              </h2>
              <p className="text-xs text-[#7090b8]">Preparação de chassi, aerodinâmica e telemetria de pista</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-[#7090b8]">SEUS CRÉDITOS</span>
              <div className="text-sm font-bold text-[#ffd166]">{playerCredits} CR</div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#142338] hover:bg-[#1f3757] text-[#9fc2e8] hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#182d49] bg-[#091526]">
          <button
            onClick={() => setActiveTab('PAINT')}
            className={`flex-1 py-3 px-4 text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'PAINT'
                ? 'bg-[#10243d] text-[#00f2fe] border-b-2 border-[#00f2fe]'
                : 'text-[#7090b8] hover:text-white'
            }`}
          >
            <Palette size={14} />
            ESTILIZAÇÃO & NEON
          </button>
          <button
            onClick={() => setActiveTab('PERFORMANCE')}
            className={`flex-1 py-3 px-4 text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'PERFORMANCE'
                ? 'bg-[#10243d] text-[#00f2fe] border-b-2 border-[#00f2fe]'
                : 'text-[#7090b8] hover:text-white'
            }`}
          >
            <Gauge size={14} />
            PERFORMANCE & TURBO
          </button>
          <button
            onClick={() => setActiveTab('TELEMETRY')}
            className={`flex-1 py-3 px-4 text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'TELEMETRY'
                ? 'bg-[#10243d] text-[#00f2fe] border-b-2 border-[#00f2fe]'
                : 'text-[#7090b8] hover:text-white'
            }`}
          >
            <Zap size={14} />
            TELEMETRIA HOLOGRÁFICA
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'PAINT' && (
            <div className="space-y-6">
              {/* Paint Swatches */}
              <div>
                <h3 className="text-xs font-bold text-[#00f2fe] tracking-wider mb-3 flex items-center gap-2">
                  <Palette size={14} /> PINTURA DA CARROCERIA (NANOTINTA ELETROLUMINESCENTE)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PAINT_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleApplyPaint(color.hex)}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                        selectedPaint === color.hex
                          ? 'bg-[#122744] border-[#00f2fe] shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                          : 'bg-[#0d1a2c] border-[#1d3350] hover:border-[#30537e]'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg ${color.class} border border-white/30`} />
                      <div className="text-left">
                        <div className="text-xs font-bold text-white">{color.name}</div>
                        <div className="text-[10px] text-[#7090b8]">Grátis no Hangar</div>
                      </div>
                      {selectedPaint === color.hex && <Check size={14} className="ml-auto text-[#00f2fe]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Underglow Neon Swatches */}
              <div>
                <h3 className="text-xs font-bold text-[#ff00aa] tracking-wider mb-3 flex items-center gap-2">
                  <Zap size={14} /> UNDERGLOW NEON LED (ILUMINAÇÃO DE SOLO)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {UNDERGLOW_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleApplyUnderglow(color.hex)}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                        selectedUnderglow === color.hex
                          ? 'bg-[#2a1128] border-[#ff00aa] shadow-[0_0_15px_rgba(255,0,170,0.3)]'
                          : 'bg-[#0d1a2c] border-[#1d3350] hover:border-[#30537e]'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg ${color.class} border border-white/30`} />
                      <div className="text-left">
                        <div className="text-xs font-bold text-white">{color.name}</div>
                        <div className="text-[10px] text-[#7090b8]">Ativo</div>
                      </div>
                      {selectedUnderglow === color.hex && <Check size={14} className="ml-auto text-[#ff00aa]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Engine Rev Test Sound */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#0d1c30] border border-[#1d3554]">
                <div>
                  <div className="text-xs font-bold text-white">TESTE DE ACELERAÇÃO & NITRO</div>
                  <div className="text-[10px] text-[#7090b8]">Gire o rotor do supercarro para ouvir a rotação</div>
                </div>
                <button
                  onClick={handleRevEngine}
                  className="px-4 py-2 rounded-xl bg-[#00f2fe]/20 hover:bg-[#00f2fe]/30 border border-[#00f2fe] text-xs font-bold text-[#00f2fe] flex items-center gap-2 cursor-pointer"
                >
                  <Gauge size={14} />
                  ACELERAR MOTOR
                </button>
              </div>
            </div>
          )}

          {activeTab === 'PERFORMANCE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((lvl) => (
                  <div
                    key={lvl}
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      turboLevel === lvl
                        ? 'bg-[#112642] border-[#00f2fe] shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                        : 'bg-[#0d1a2c] border-[#1d3350]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">ESTÁGIO {lvl}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#00f2fe]/20 text-[#00f2fe]">
                          {lvl === 1 ? 'STOCK' : lvl === 2 ? 'TWIN-TURBO' : 'PLASMA NITRO'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8aa6c8] mb-3">
                        {lvl === 1
                          ? 'Configuração de fábrica equilibrada para cruzeiro na cidade.'
                          : lvl === 2
                          ? 'Compressor biturbo com 135 km/h de velocidade máxima.'
                          : 'Injeção direta de plasma criogênico e escape sem restrição.'}
                      </p>
                      <div className="space-y-1.5 text-[10px]">
                        <div className="flex justify-between text-[#7090b8]">
                          <span>Velocidade Máxima:</span>
                          <span className="text-white font-bold">{110 + lvl * 18} KM/H</span>
                        </div>
                        <div className="flex justify-between text-[#7090b8]">
                          <span>Aceleração 0-100:</span>
                          <span className="text-white font-bold">{(4.2 - lvl * 0.7).toFixed(1)}s</span>
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={turboLevel === lvl}
                      onClick={() => handleUpgradeTurbo(lvl)}
                      className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        turboLevel === lvl
                          ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40 cursor-default'
                          : 'bg-[#00f2fe] hover:bg-[#38f5ff] text-black font-extrabold'
                      }`}
                    >
                      {turboLevel === lvl ? 'INSTALADO' : `UPGRADE (${lvl * 30} CR)`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'TELEMETRY' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0a1628] border border-[#1b314e] grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-[10px] text-[#7090b8]">MOTOR</div>
                  <div className="text-sm font-bold text-white">V8 Cyber-Twin</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#7090b8]">TRAÇÃO</div>
                  <div className="text-sm font-bold text-[#00f2fe]">AWD Vetorizada</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#7090b8]">SUSPENSÃO</div>
                  <div className="text-sm font-bold text-white">Magnética Ativa</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#7090b8]">BLINDAGEM</div>
                  <div className="text-sm font-bold text-[#39ff14]">Nível IV Kevlar</div>
                </div>
              </div>

              {/* Synthetic Graph */}
              <div className="p-4 rounded-xl bg-[#091424] border border-[#182c46]">
                <div className="text-xs font-bold text-[#00f2fe] mb-2 flex items-center gap-2">
                  <Gauge size={14} /> CURVA DE POTÊNCIA (RPM vs TORQUE DINÂMICO)
                </div>
                <div className="h-32 w-full flex items-end gap-1.5 pt-4">
                  {[20, 35, 50, 68, 85, 96, 92, 88, 82, 75, 70, 65, 58].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-[#00f2fe] to-[#ff00aa] rounded-t-sm"
                        style={{ height: `${val}%` }}
                      />
                      <span className="text-[8px] text-[#7090b8]">{i * 800}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#182d49] bg-[#0c1a2e] flex items-center justify-between text-xs text-[#7090b8]">
          <span>Oficina AUTO-MOD 31 · Nexus District</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00f2fe] hover:bg-[#38f5ff] text-black font-extrabold cursor-pointer"
          >
            VOLTAR AO JOGO
          </button>
        </div>
      </div>
    </div>
  );
};
