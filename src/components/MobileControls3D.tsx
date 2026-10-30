import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, ArrowUpCircle, MessageSquare } from 'lucide-react';

interface MobileControls3DProps {
  onMoveStart: (forward: number, strafe: number) => void;
  onMoveEnd: () => void;
  onJump: () => void;
  onInteract: () => void;
  onToggleSprint: () => void;
  isSprinting: boolean;
  canInteract: boolean;
}

export const MobileControls3D: React.FC<MobileControls3DProps> = ({
  onMoveStart,
  onMoveEnd,
  onJump,
  onInteract,
  onToggleSprint,
  isSprinting,
  canInteract,
}) => {
  return (
    <div className="absolute inset-x-3 bottom-3 flex items-end justify-between pointer-events-none z-20 select-none md:hidden font-mono">
      {/* Virtual D-pad */}
      <div className="pointer-events-auto grid grid-cols-3 grid-rows-3 gap-1.5 w-36 h-36 bg-[#070e1cb3] backdrop-blur-md p-2 rounded-2xl border border-[#1d3c63]">
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onMoveStart(1, 0);
          }}
          onPointerUp={onMoveEnd}
          onPointerCancel={onMoveEnd}
          className="col-start-2 row-start-1 flex items-center justify-center bg-[#102237] active:bg-[#1a385b] border border-[#234b7a] rounded-xl text-white"
        >
          <ArrowUp size={20} className="text-[#00f2fe]" />
        </button>

        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onMoveStart(0, -1);
          }}
          onPointerUp={onMoveEnd}
          onPointerCancel={onMoveEnd}
          className="col-start-1 row-start-2 flex items-center justify-center bg-[#102237] active:bg-[#1a385b] border border-[#234b7a] rounded-xl text-white"
        >
          <ArrowLeft size={20} className="text-[#00f2fe]" />
        </button>

        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onMoveStart(-1, 0);
          }}
          onPointerUp={onMoveEnd}
          onPointerCancel={onMoveEnd}
          className="col-start-2 row-start-3 flex items-center justify-center bg-[#102237] active:bg-[#1a385b] border border-[#234b7a] rounded-xl text-white"
        >
          <ArrowDown size={20} className="text-[#00f2fe]" />
        </button>

        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onMoveStart(0, 1);
          }}
          onPointerUp={onMoveEnd}
          onPointerCancel={onMoveEnd}
          className="col-start-3 row-start-2 flex items-center justify-center bg-[#102237] active:bg-[#1a385b] border border-[#234b7a] rounded-xl text-white"
        >
          <ArrowRight size={20} className="text-[#00f2fe]" />
        </button>
      </div>

      {/* Action buttons: Sprint, Jump, Interact */}
      <div className="pointer-events-auto flex flex-col gap-2">
        {canInteract && (
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onInteract();
            }}
            className="w-14 h-14 rounded-2xl bg-[#00f2fe]/20 active:bg-[#00f2fe]/40 border-2 border-[#00f2fe] text-[#00f2fe] flex flex-col items-center justify-center font-bold shadow-lg"
          >
            <MessageSquare size={18} />
            <span className="text-[9px]">E</span>
          </button>
        )}

        <div className="flex gap-2">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onToggleSprint();
            }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-xs ${
              isSprinting
                ? 'bg-[#00f2fe] text-black border-[#00f2fe]'
                : 'bg-[#0e1c2e] text-slate-300 border-[#1d3d63]'
            }`}
          >
            <Zap size={16} />
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onJump();
            }}
            className="w-14 h-14 rounded-2xl bg-[#122742] active:bg-[#1c3f6b] border border-[#234d7d] text-white flex flex-col items-center justify-center font-bold text-xs shadow-lg"
          >
            <ArrowUpCircle size={20} className="text-[#00f2fe]" />
            <span className="text-[9px]">PULO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
