import React, { useState } from 'react';
import { Music, Disc, Sparkles, Volume2, X, Play, Pause, Flame } from 'lucide-react';
import { gameAudio } from '../game3d/core/Audio';

interface NightclubModalProps {
  onClose: () => void;
}

export const NightclubModal: React.FC<NightclubModalProps> = ({ onClose }) => {
  const [activePad, setActivePad] = useState<number | null>(null);
  const [bpm, setBpm] = useState<number>(128);
  const [hypeLevel, setHypeLevel] = useState<number>(75);
  const [crowdMode, setCrowdMode] = useState<'DANCING' | 'VIP' | 'CHILL'>('DANCING');

  const soundPads = [
    { id: 1, label: 'SYNTH LEAD', color: 'from-[#ff0077] to-[#ff5fa2]' },
    { id: 2, label: 'CYBER BASS', color: 'from-[#00f2fe] to-[#4facfe]' },
    { id: 3, label: 'NEON KICK', color: 'from-[#9d00ff] to-[#e056fd]' },
    { id: 4, label: 'HI-HAT ROLL', color: 'from-[#ffaa00] to-[#ffd166]' },
    { id: 5, label: 'LASER RISER', color: 'from-[#39ff14] to-[#00f2fe]' },
    { id: 6, label: 'VOCODER DROP', color: 'from-[#ff0055] to-[#7928ca]' },
  ];

  const handleTriggerPad = (padId: number) => {
    setActivePad(padId);
    gameAudio.playRadioBeat(padId);
    setHypeLevel((prev) => Math.min(100, prev + 5));
    setTimeout(() => setActivePad(null), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono select-none">
      <div className="relative w-full max-w-3xl bg-[#0e0717] border-2 border-[#ff0077] rounded-2xl shadow-[0_0_40px_rgba(255,0,119,0.35)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#31113b] bg-[#1a0a2b]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#ff0077]/20 border border-[#ff0077]/50 text-[#ff0077]">
              <Disc size={22} className="animate-spin" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                THE <span className="text-[#ff0077]">CYBER-DOME</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#ff0077]/20 text-[#ff0077] border border-[#ff0077]/40">
                  DJ BOOTH & PISTA
                </span>
              </h2>
              <p className="text-xs text-[#b88ab8]">Clube noturno mais exclusivo da orla de Neon Frontier</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#28133b] hover:bg-[#3d1d5a] text-[#dca6dc] hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Stage & Visualizer */}
        <div className="p-6 space-y-6">
          <div className="relative h-36 rounded-2xl bg-gradient-to-b from-[#180826] to-[#0c0414] border border-[#441753] p-4 flex flex-col justify-between overflow-hidden">
            {/* Animated lasers background */}
            <div className="absolute inset-0 opacity-30 flex justify-around items-end">
              {[60, 85, 45, 95, 70, 80, 50, 90, 65, 75].map((val, i) => (
                <div
                  key={i}
                  className="w-3 bg-gradient-to-t from-[#ff0077] via-[#00f2fe] to-white rounded-t-full transition-all duration-150 animate-pulse"
                  style={{ height: `${val}%`, animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Flame size={16} className="text-[#ffaa00]" />
                ENERGIA DA MULTIDÃO: <span className="text-[#ff0077]">{hypeLevel}%</span>
              </div>
              <div className="text-xs font-bold text-[#00f2fe]">BPM: {bpm} · 4/4 BEAT</div>
            </div>

            <div className="relative z-10 w-full bg-[#200d33] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#ff0077] via-[#9d00ff] to-[#00f2fe] transition-all duration-300"
                style={{ width: `${hypeLevel}%` }}
              />
            </div>
          </div>

          {/* Interactive DJ Soundboard */}
          <div>
            <div className="text-xs font-bold text-[#ff0077] tracking-wider mb-3 flex items-center gap-2">
              <Music size={14} /> MESA DE MIXAGEM AO VIVO (CLIQUE NOS PADS PARA TOCAR)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {soundPads.map((pad) => (
                <button
                  key={pad.id}
                  onClick={() => handleTriggerPad(pad.id)}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    activePad === pad.id
                      ? 'bg-gradient-to-br from-[#ff0077] to-[#9d00ff] border-white scale-95 shadow-[0_0_20px_rgba(255,0,119,0.5)]'
                      : 'bg-[#180a27] border-[#38164b] hover:border-[#ff0077]'
                  }`}
                >
                  <Disc size={20} className={activePad === pad.id ? 'text-white' : 'text-[#ff0077]'} />
                  <span className="text-xs font-bold text-white tracking-wider">{pad.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lounge Sector Switch */}
          <div className="flex gap-2">
            {(['DANCING', 'VIP', 'CHILL'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCrowdMode(mode)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer ${
                  crowdMode === mode
                    ? 'bg-[#ff0077] text-white'
                    : 'bg-[#1b0a2c] text-[#9b6f9b] hover:text-white border border-[#3b1752]'
                }`}
              >
                {mode === 'DANCING' ? 'PISTA DE DANÇA' : mode === 'VIP' ? 'CAMAROTE VIP' : 'LOUNGE CHILLOUT'}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#31113b] bg-[#1a0a2b] flex items-center justify-between text-xs text-[#9b6f9b]">
          <span>The Cyber-Dome · Distrito Portuário</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#ff0077] hover:bg-[#ff3388] text-white font-extrabold cursor-pointer"
          >
            VOLTAR À CIDADE
          </button>
        </div>
      </div>
    </div>
  );
};
