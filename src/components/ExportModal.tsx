import React, { useState } from 'react';
import { Code2, Download, Copy, Check, Terminal, FileCode, X, ExternalLink } from 'lucide-react';

interface ExportModalProps {
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const localRunInstructions = `# Executar NEON FRONTIER 3D localmente no seu computador

# 1. Clonar ou extrair o repositório
git clone https://github.com/THZWolf/GAME-1.git
cd GAME-1

# 2. Instalar dependências (Node 18+)
npm install

# 3. Iniciar o servidor de desenvolvimento Vite em porta local
npm run dev

# 4. Compilar para distribuição estática de alta performance
npm run build
npm run preview
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(localRunInstructions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZipReadme = () => {
    const blob = new Blob([localRunInstructions], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NEON_FRONTIER_3D_LOCAL_RUN.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono select-none">
      <div className="w-full max-w-2xl bg-[#08111e] border-2 border-[#1c395e] rounded-2xl shadow-[0_0_60px_rgba(0,242,254,0.18)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1b3456] flex items-center justify-between bg-[#0c182b]">
          <div className="flex items-center gap-2.5">
            <Code2 size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-widest font-['Chakra_Petch']">
              EXPORTAR CÓDIGO-FONTE & DESENVOLVIMENTO LOCAL
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#162742] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs text-slate-300">
          <p className="text-slate-300 leading-relaxed">
            O <strong className="text-[#00f2fe]">NEON FRONTIER 3D</strong> foi projetado com arquitetura
            100% modular e reproduzível. Todo o código do motor gráfico Three.js, controle de personagem em
            terceira pessoa, física de colisões e agentes com memória episódica residem diretamente nesta base.
          </p>

          <div className="bg-[#050912] border border-[#162a42] rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#132238] text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-[#00f2fe]">
                <Terminal size={13} /> Comandos de Inicialização Local
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#102237] hover:bg-[#183353] text-cyan-300 transition-colors cursor-pointer"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <pre className="text-emerald-400 overflow-x-auto text-[11px] leading-relaxed">
              {localRunInstructions}
            </pre>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-[#0d1c31] border border-[#1a385f]">
              <div className="text-[#00f2fe] font-bold mb-1 flex items-center gap-1">
                <FileCode size={13} /> /src/game3d/
              </div>
              <p className="text-[11px] text-slate-400">
                Core Three.js, PlayerController, CityDistrict, CollisionSystem, NPCManager e NPCMemory.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#0d1c31] border border-[#1a385f]">
              <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1">
                <FileCode size={13} /> /src/components/
              </div>
              <p className="text-[11px] text-slate-400">
                GameHUD, DialogueModal, DiagnosticsOverlay, MainMenu e PauseMenu.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1b3456] bg-[#060c17] flex justify-between items-center">
          <button
            onClick={handleDownloadZipReadme}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#142842] hover:bg-[#1b375d] text-cyan-300 text-xs font-semibold border border-[#214777] transition-colors cursor-pointer"
          >
            <Download size={13} /> Baixar Guia de Build
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#132742] hover:bg-[#1b375c] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
