import React, { useState } from 'react';
import { Play, Settings, Compass, HelpCircle, Code2, ShieldCheck, Zap } from 'lucide-react';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenExport: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onOpenExport }) => {
  const [activeTab, setActiveTab] = useState<'main' | 'controls' | 'settings'>('main');
  const [graphicsQuality, setGraphicsQuality] = useState<'high' | 'medium' | 'low'>('high');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-[#060c18fa] via-[#09152aee] to-[#040812fa] backdrop-blur-xl select-none font-mono">
      {/* Background ambient neon glow */}
      <div className="absolute w-[600px] h-[600px] bg-[#00f2fe]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-[#ff4d8d]/10 rounded-full blur-[120px] pointer-events-none translate-x-40 translate-y-32" />

      <div className="relative w-full max-w-xl bg-[#091322] border-2 border-[#1c395e] rounded-3xl shadow-[0_0_80px_rgba(0,242,254,0.18)] overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="p-8 pb-6 text-center border-b border-[#182f4d] bg-[#0b172a]/80">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#122744] border border-[#214b7e] text-[10px] text-[#00f2fe] tracking-widest uppercase mb-3">
            <Zap size={12} /> Jogo 3D Independente · Three.js Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-white font-['Chakra_Petch']">
            NEON <span className="text-[#00f2fe] drop-shadow-[0_0_20px_#00f2fe88]">FRONTIER 3D</span>
          </h1>
          <p className="text-xs text-[#8ca8cc] max-w-md mx-auto mt-2 leading-relaxed">
            Explore o distrito urbano futurista de Nexus. Interaja com cidadãos e operativos autônomos dotados
            de memória episódica persistente e navegue pela cidade em terceira pessoa.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#182f4d] bg-[#070e1b] text-xs">
          <button
            onClick={() => setActiveTab('main')}
            className={`flex-1 py-3 text-center font-bold tracking-wider transition-colors cursor-pointer ${
              activeTab === 'main'
                ? 'text-[#00f2fe] border-b-2 border-[#00f2fe] bg-[#0d1c33]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            MENU PRINCIPAL
          </button>
          <button
            onClick={() => setActiveTab('controls')}
            className={`flex-1 py-3 text-center font-bold tracking-wider transition-colors cursor-pointer ${
              activeTab === 'controls'
                ? 'text-[#00f2fe] border-b-2 border-[#00f2fe] bg-[#0d1c33]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CONTROLES
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-center font-bold tracking-wider transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'text-[#00f2fe] border-b-2 border-[#00f2fe] bg-[#0d1c33]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CONFIGURAÇÕES
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'main' && (
            <div className="space-y-3">
              <button
                onClick={onStartGame}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#00b4db] to-[#0083b0] hover:from-[#00c6ff] hover:to-[#0072ff] text-white font-bold tracking-wider shadow-lg shadow-cyan-900/30 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Play size={20} className="fill-white" />
                <span className="text-sm font-['Chakra_Petch']">INICIAR EXPLORAÇÃO 3D</span>
              </button>

              <button
                onClick={() => setActiveTab('controls')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0f1f35] hover:bg-[#162c4a] text-slate-200 border border-[#1e3d64] text-xs font-semibold transition-colors cursor-pointer"
              >
                <HelpCircle size={15} className="text-[#00f2fe]" /> Ver Guia de Controles
              </button>

              <button
                onClick={onOpenExport}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0a1728] hover:bg-[#12233b] text-slate-300 border border-[#1b3456] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Code2 size={15} className="text-emerald-400" /> Exportar Código-Fonte / Executar Local
              </button>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-[#0d1b2f] border border-[#1b3456]">
                  <div className="text-[#00f2fe] font-bold">W, A, S, D</div>
                  <div className="text-[11px] text-slate-400">Movimentar Operativo</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0d1b2f] border border-[#1b3456]">
                  <div className="text-[#00f2fe] font-bold">Mouse / Clique</div>
                  <div className="text-[11px] text-slate-400">Girar Câmera (Pointer Lock)</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0d1b2f] border border-[#1b3456]">
                  <div className="text-[#00f2fe] font-bold">Shift</div>
                  <div className="text-[11px] text-slate-400">Correr (Consome Estamina)</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0d1b2f] border border-[#1b3456]">
                  <div className="text-[#00f2fe] font-bold">Espaço</div>
                  <div className="text-[11px] text-slate-400">Pular</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0d1b2f] border border-[#1b3456]">
                  <div className="text-[#00f2fe] font-bold">E</div>
                  <div className="text-[11px] text-slate-400">Interagir com NPCs e Terminais</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0d1b2f] border border-[#1b3456]">
                  <div className="text-[#00f2fe] font-bold">Esc / F3</div>
                  <div className="text-[11px] text-slate-400">Menu de Pausa / Diagnóstico</div>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('main')}
                className="w-full mt-3 py-2.5 rounded-xl bg-[#132842] hover:bg-[#1a365a] text-white text-xs font-semibold cursor-pointer"
              >
                Voltar
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1.5 font-bold">Qualidade Gráfica:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['high', 'medium', 'low'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setGraphicsQuality(q)}
                      className={`py-2 rounded-xl border text-xs font-bold uppercase transition-colors cursor-pointer ${
                        graphicsQuality === q
                          ? 'bg-[#00f2fe]/20 text-[#00f2fe] border-[#00f2fe]'
                          : 'bg-[#0d1b2f] text-slate-400 border-[#1c365a]'
                      }`}
                    >
                      {q === 'high' ? 'Alta (PBR)' : q === 'medium' ? 'Média' : 'Baixa'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0d1a2c] border border-[#193354] text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck size={14} /> Três camadas de persistência local ativas
                </div>
                <p className="text-slate-400">
                  Suas memórias com os 5 NPCs e seu saldo de cripto-créditos são salvos automaticamente no
                  seu navegador.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('main')}
                className="w-full py-2.5 rounded-xl bg-[#132842] hover:bg-[#1a365a] text-white text-xs font-semibold cursor-pointer"
              >
                Salvar e Voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
