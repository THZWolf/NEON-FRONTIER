import React from 'react';
import { Users, Shield, Terminal, Gauge, Check, X } from 'lucide-react';
import { CharacterProfile, CHARACTER_PROFILES } from '../game3d/player/CharacterProfiles';
import { gameAudio } from '../game3d/core/Audio';

interface CharacterSwitchModalProps {
  currentProfile: CharacterProfile;
  onSelectProfile: (profile: CharacterProfile) => void;
  onClose: () => void;
}

export const CharacterSwitchModal: React.FC<CharacterSwitchModalProps> = ({
  currentProfile,
  onSelectProfile,
  onClose,
}) => {
  const handleSelect = (profile: CharacterProfile) => {
    onSelectProfile(profile);
    gameAudio.playWantedLevelUp();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono select-none">
      <div className="relative w-full max-w-3xl bg-[#090e18] border-2 border-[#00f2fe] rounded-2xl shadow-[0_0_40px_rgba(0,242,254,0.35)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b2d49] bg-[#0d1728]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00f2fe]/20 border border-[#00f2fe]/50 text-[#00f2fe]">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                TROCA DE <span className="text-[#00f2fe]">PERSONAGEM ATIVA</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40">
                  SELEÇÃO DE OPERATIVO
                </span>
              </h2>
              <p className="text-xs text-[#7090b8]">Alterne o papel do seu protagonista durante a exploração livre</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#142338] hover:bg-[#1f3757] text-[#9fc2e8] hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Characters Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CHARACTER_PROFILES.map((char) => {
            const isSelected = char.id === currentProfile.id;
            return (
              <div
                key={char.id}
                onClick={() => handleSelect(char)}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#12243d] border-[#00f2fe] shadow-[0_0_20px_rgba(0,242,254,0.35)] scale-102'
                    : 'bg-[#0b1320] border-[#1d314a] hover:border-[#33537e]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded font-bold"
                      style={{
                        backgroundColor: `${char.themeColor}22`,
                        color: char.themeColor,
                        border: `1px solid ${char.themeColor}55`,
                      }}
                    >
                      {char.codename}
                    </span>
                    {isSelected && <Check size={16} className="text-[#00f2fe]" />}
                  </div>

                  <div className="text-sm font-bold text-white mb-0.5">{char.name}</div>
                  <div className="text-[11px] text-[#7899be] mb-3">{char.role}</div>

                  <p className="text-[10px] text-[#9cbcdb] mb-4 leading-relaxed line-clamp-3">
                    {char.bio}
                  </p>

                  <div className="p-2.5 rounded-lg bg-[#070c14] border border-[#16273c] text-[10px] text-[#00f2fe] font-bold mb-3">
                    {char.perk}
                  </div>

                  {/* Stat bars */}
                  <div className="space-y-1.5 text-[9px] text-[#7090b8]">
                    <div className="flex justify-between">
                      <span>Combate:</span>
                      <span className="text-white font-bold">{char.stats.combat}%</span>
                    </div>
                    <div className="w-full h-1 bg-[#142338] rounded-full overflow-hidden">
                      <div className="h-full bg-[#00f2fe]" style={{ width: `${char.stats.combat}%` }} />
                    </div>

                    <div className="flex justify-between">
                      <span>Direção:</span>
                      <span className="text-white font-bold">{char.stats.driving}%</span>
                    </div>
                    <div className="w-full h-1 bg-[#142338] rounded-full overflow-hidden">
                      <div className="h-full bg-[#ffaa00]" style={{ width: `${char.stats.driving}%` }} />
                    </div>

                    <div className="flex justify-between">
                      <span>Hacking:</span>
                      <span className="text-white font-bold">{char.stats.hacking}%</span>
                    </div>
                    <div className="w-full h-1 bg-[#142338] rounded-full overflow-hidden">
                      <div className="h-full bg-[#ff0077]" style={{ width: `${char.stats.hacking}%` }} />
                    </div>
                  </div>
                </div>

                <button
                  className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#00f2fe] text-black font-extrabold'
                      : 'bg-[#15273e] hover:bg-[#1f3757] text-[#9fc2e8]'
                  }`}
                >
                  {isSelected ? 'OPERATIVO ATIVO' : 'SELECIONAR'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1b2d49] bg-[#0d1728] flex items-center justify-between text-xs text-[#7090b8]">
          <span>Pressione [Tab] durante o jogo para alternar rapidamente</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#142338] hover:bg-[#1f3757] text-white text-xs font-bold cursor-pointer"
          >
            CONFIRMAR
          </button>
        </div>
      </div>
    </div>
  );
};
