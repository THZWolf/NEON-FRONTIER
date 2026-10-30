import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MessageSquare, Hammer, Car, Sparkles } from 'lucide-react';

interface MobileControlsProps {
  onMoveStart: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onMoveEnd: () => void;
  onInteract: () => void;
  onBuild: () => void;
  onVehicle: () => void;
  onCollect: () => void;
  buildMode: boolean;
  inVehicle: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMoveStart,
  onMoveEnd,
  onInteract,
  onBuild,
  onVehicle,
  onCollect,
  buildMode,
  inVehicle,
}) => {
  return (
    <div className="absolute inset-x-2.5 bottom-2.5 flex items-end justify-between pointer-events-none z-20 select-none md:hidden">
      {/* VIRTUAL DPAD */}
      <div className="pointer-events-auto grid grid-cols-3 grid-rows-2 gap-1.5 w-36 h-24 bg-[#0a1424]/80 backdrop-blur-md p-1.5 rounded-xl border border-[#2d4766]">
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onMoveStart('up');
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onMoveEnd();
          }}
          onPointerCancel={onMoveEnd}
          className="col-start-2 row-start-1 flex items-center justify-center bg-[#132338] active:bg-[#1f3f5c] border border-[#345170] rounded-lg text-[#eaf5ff]"
          aria-label="Cima"
        >
          <ArrowUp size={20} className="text-[#66f4e8]" />
        </button>

        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onMoveStart('left');
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onMoveEnd();
          }}
          onPointerCancel={onMoveEnd}
          className="col-start-1 row-start-2 flex items-center justify-center bg-[#132338] active:bg-[#1f3f5c] border border-[#345170] rounded-lg text-[#eaf5ff]"
          aria-label="Esquerda"
        >
          <ArrowLeft size={20} className="text-[#66f4e8]" />
        </button>

        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onMoveStart('down');
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onMoveEnd();
          }}
          onPointerCancel={onMoveEnd}
          className="col-start-2 row-start-2 flex items-center justify-center bg-[#132338] active:bg-[#1f3f5c] border border-[#345170] rounded-lg text-[#eaf5ff]"
          aria-label="Baixo"
        >
          <ArrowDown size={20} className="text-[#66f4e8]" />
        </button>

        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onMoveStart('right');
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onMoveEnd();
          }}
          onPointerCancel={onMoveEnd}
          className="col-start-3 row-start-2 flex items-center justify-center bg-[#132338] active:bg-[#1f3f5c] border border-[#345170] rounded-lg text-[#eaf5ff]"
          aria-label="Direita"
        >
          <ArrowRight size={20} className="text-[#66f4e8]" />
        </button>
      </div>

      {/* ACTION BUTTONS */}
      <div className="pointer-events-auto grid grid-cols-2 gap-1.5 bg-[#0a1424]/80 backdrop-blur-md p-1.5 rounded-xl border border-[#2d4766]">
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onInteract();
          }}
          className="w-13 h-11 flex flex-col items-center justify-center bg-[#132338] active:bg-[#1f3f5c] border border-[#345170] rounded-lg text-[#eaf5ff] text-[9px] font-bold"
        >
          <MessageSquare size={14} className="text-[#ff5fa2]" />
          <span>FALAR</span>
        </button>

        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onBuild();
          }}
          className={`w-13 h-11 flex flex-col items-center justify-center border rounded-lg text-[9px] font-bold ${
            buildMode ? 'bg-[#10474b] border-[#66f4e8] text-[#66f4e8]' : 'bg-[#132338] active:bg-[#1f3f5c] border-[#345170] text-[#eaf5ff]'
          }`}
        >
          <Hammer size={14} className="text-[#66f4e8]" />
          <span>BUILD</span>
        </button>

        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onVehicle();
          }}
          className={`w-13 h-11 flex flex-col items-center justify-center border rounded-lg text-[9px] font-bold ${
            inVehicle ? 'bg-[#10474b] border-[#66f4e8] text-[#66f4e8]' : 'bg-[#132338] active:bg-[#1f3f5c] border-[#345170] text-[#eaf5ff]'
          }`}
        >
          <Car size={14} className="text-[#66f4e8]" />
          <span>CARRO</span>
        </button>

        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onCollect();
          }}
          className="w-13 h-11 flex flex-col items-center justify-center bg-[#132338] active:bg-[#1f3f5c] border border-[#345170] rounded-lg text-[#eaf5ff] text-[9px] font-bold"
        >
          <Sparkles size={14} className="text-[#ffd166]" />
          <span>COLETAR</span>
        </button>
      </div>
    </div>
  );
};
