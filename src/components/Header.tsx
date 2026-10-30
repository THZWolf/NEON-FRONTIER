import React from 'react';
import { Volume2, VolumeX, Pause, Play, Menu } from 'lucide-react';

interface HeaderProps {
  saveStatus: string;
  isPaused: boolean;
  soundEnabled: boolean;
  onTogglePause: () => void;
  onToggleSound: () => void;
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  saveStatus,
  isPaused,
  soundEnabled,
  onTogglePause,
  onToggleSound,
  onOpenMenu,
}) => {
  return (
    <header className="flex items-center justify-between px-3 md:px-5 py-2.5 bg-[#0a1120] border-b border-[#1f3049] select-none z-10 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg md:text-xl font-bold tracking-widest text-[#eaf5ff] flex items-center gap-1.5 m-0 font-['Chakra_Petch']">
          NEON <span className="text-[#66f4e8] drop-shadow-[0_0_8px_rgba(102,244,232,0.6)]">FRONTIER</span>
        </h1>
        <span className="hidden sm:inline-block text-[11px] text-[#9bb0c9] tracking-wider border-l border-[#24374e] pl-3 py-0.5 font-mono">
          FRONTEIRA URBANA · REACT BUILD
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <span className="text-[10px] md:text-xs font-mono px-2.5 py-1 rounded-full border border-[#304761] bg-[#0d1727] text-[#9bb0c9] tracking-wider">
          {saveStatus}
        </span>

        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Silenciar áudio' : 'Ativar áudio'}
          className="p-1.5 md:p-2 rounded-lg bg-[#15253b] hover:bg-[#1a4050] border border-[#34506e] hover:border-[#66f4e8] text-[#eaf5ff] transition-all cursor-pointer"
        >
          {soundEnabled ? <Volume2 size={15} className="text-[#66f4e8]" /> : <VolumeX size={15} className="text-[#9bb0c9]" />}
        </button>

        <button
          onClick={onTogglePause}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 md:px-3 py-1.5 rounded-lg bg-[#15253b] hover:bg-[#1a4050] border border-[#34506e] hover:border-[#66f4e8] text-[#eaf5ff] transition-all cursor-pointer"
        >
          {isPaused ? (
            <>
              <Play size={13} className="text-[#66f4e8]" />
              <span>Jogar</span>
            </>
          ) : (
            <>
              <Pause size={13} className="text-[#66f4e8]" />
              <span>Pausar</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenMenu}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 md:px-3 py-1.5 rounded-lg bg-[#15253b] hover:bg-[#1a4050] border border-[#34506e] hover:border-[#66f4e8] text-[#eaf5ff] transition-all cursor-pointer"
        >
          <Menu size={13} />
          <span className="hidden xs:inline">Menu</span>
        </button>
      </div>
    </header>
  );
};
