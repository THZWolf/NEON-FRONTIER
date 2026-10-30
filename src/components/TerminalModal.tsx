import React, { useState } from 'react';
import { Terminal, ShieldAlert, Cpu, Download, X, Coins, CheckCircle2 } from 'lucide-react';
import { gameAudio } from '../game3d/core/Audio';

interface TerminalModalProps {
  terminalName: string;
  playerCredits: number;
  onAddCredits: (amount: number) => void;
  onClose: () => void;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({
  terminalName,
  playerCredits,
  onAddCredits,
  onClose,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleHarvest = () => {
    if (downloaded) return;
    setDownloaded(true);
    onAddCredits(25);
    gameAudio.playInteract();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md font-mono select-none">
      <div className="w-full max-w-lg bg-[#070e1c] border-2 border-[#00f2fe]/40 rounded-2xl shadow-[0_0_50px_rgba(0,242,254,0.2)] overflow-hidden flex flex-col">
        {/* Terminal Header */}
        <div className="px-5 py-4 border-b border-[#1b3456] flex items-center justify-between bg-[#0b172a]">
          <div className="flex items-center gap-2.5">
            <Terminal size={18} className="text-[#00f2fe]" />
            <h3 className="text-sm font-bold text-white tracking-widest font-['Chakra_Petch']">
              {terminalName.toUpperCase()}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#162742] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Console log content */}
        <div className="p-5 space-y-4">
          <div className="bg-[#040810] border border-[#162a42] rounded-xl p-4 text-xs space-y-2 text-cyan-300">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Cpu size={14} /> SISTEMA NEXUS OS v4.81 - CONEXÃO CRIPTOGRAFADA
            </div>
            <p className="text-slate-400">
              Setor: <span className="text-white">Praça Central / Distrito Nexus</span>
            </p>
            <p className="text-slate-400">
              Protocolo de Segurança: <span className="text-[#00f2fe]">Autônomo Sub-rede Zero</span>
            </p>
            <p className="text-slate-300 leading-relaxed pt-2 border-t border-[#122238]">
              "A rede neural urbana de Neon Frontier permanece em constante observação. Cinco operativos
              autônomos foram identificados patrulhando o quadrante central. Suas memórias episódicas
              estão sendo sincronizadas com o banco local de telemetria."
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0c182b] border border-[#1b3353]">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Coins size={14} className="text-[#ffd166]" />
              <span>Saldo Atual: <strong className="text-white font-bold">{playerCredits}</strong> créditos</span>
            </div>
            <button
              onClick={handleHarvest}
              disabled={downloaded}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                downloaded
                  ? 'bg-[#15231c] text-emerald-400 border border-emerald-900 cursor-default'
                  : 'bg-[#00f2fe]/20 hover:bg-[#00f2fe]/30 text-[#00f2fe] border border-[#00f2fe]/40'
              }`}
            >
              {downloaded ? (
                <>
                  <CheckCircle2 size={13} /> Dados Extraídos
                </>
              ) : (
                <>
                  <Download size={13} /> Extrair Cripto-Créditos (+25)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1b3456] bg-[#050a14] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#14263f] hover:bg-[#1d3557] text-white text-xs font-semibold border border-[#23436b] transition-colors cursor-pointer"
          >
            Desconectar Terminal (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
