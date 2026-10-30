import React, { useState } from 'react';
import { Shield, Crosshair, Zap, DollarSign, X, Check, ShoppingBag, Plus } from 'lucide-react';
import { CombatSystem } from '../game3d/combat/CombatSystem';
import { gameAudio } from '../game3d/core/Audio';

interface AmmuNationModalProps {
  combatSystem: CombatSystem;
  playerCredits: number;
  onUpdateCredits: (newAmount: number) => void;
  onClose: () => void;
}

export const AmmuNationModal: React.FC<AmmuNationModalProps> = ({
  combatSystem,
  playerCredits,
  onUpdateCredits,
  onClose,
}) => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const notify = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleBuyRifleAmmo = () => {
    const cost = 25;
    if (playerCredits >= cost) {
      onUpdateCredits(playerCredits - cost);
      combatSystem.weapons[1].reserveAmmo += 60;
      gameAudio.playInteract();
      notify('+60 Munições de Arc-Rifle adquiridas!');
    }
  };

  const handleBuyHeavyAmmo = () => {
    const cost = 40;
    if (playerCredits >= cost) {
      onUpdateCredits(playerCredits - cost);
      combatSystem.weapons[2].reserveAmmo += 12;
      gameAudio.playInteract();
      notify('+12 Células de Viper Cannon adquiridas!');
    }
  };

  const handleBuyArmor = () => {
    const cost = 35;
    if (playerCredits >= cost) {
      onUpdateCredits(playerCredits - cost);
      combatSystem.armor = Math.min(100, combatSystem.armor + 50);
      gameAudio.playInteract();
      notify('Colete Balístico Nível III Reparado (+50 Armadura)!');
    }
  };

  const handleBuyMedkit = () => {
    const cost = 20;
    if (playerCredits >= cost) {
      onUpdateCredits(playerCredits - cost);
      combatSystem.health = Math.min(100, combatSystem.health + 40);
      gameAudio.playInteract();
      notify('Nanogel Médico Aplicado (+40 Saúde)!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono select-none">
      <div className="relative w-full max-w-3xl bg-[#120a0d] border-2 border-[#ff3344] rounded-2xl shadow-[0_0_40px_rgba(255,51,68,0.35)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3d1419] bg-[#220d11]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#ff3344]/20 border border-[#ff3344]/50 text-[#ff3344]">
              <Crosshair size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                AMMU-NATION <span className="text-[#ff3344]">ARMORY</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#ff3344]/20 text-[#ff3344] border border-[#ff3344]/40">
                  BALÍSTICA MILITAR
                </span>
              </h2>
              <p className="text-xs text-[#b88086]">Arsenal tático certificado pelo Sindicato de Neon Frontier</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-[#b88086]">SEUS CRÉDITOS</span>
              <div className="text-sm font-bold text-[#ffd166]">{playerCredits} CR</div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#2e1317] hover:bg-[#471a20] text-[#dca0a6] hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Success toast */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-[#2a1318] border border-[#ff3344] text-xs text-[#ff5566] font-bold flex items-center gap-2 animate-pulse">
            <Check size={16} />
            {successMsg}
          </div>
        )}

        {/* Catalog */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Arc-Rifle Ammo */}
          <div className="p-4 rounded-xl bg-[#1c0f12] border border-[#3b171c] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-white">CARREGADOR NF-7</span>
                <span className="text-xs font-bold text-[#ffd166]">25 CR</span>
              </div>
              <p className="text-[11px] text-[#9c767a] mb-3">
                60 cartuchos de plasma estabilizado para o rifle tático Arc-Rifle NF-7.
              </p>
              <div className="text-[10px] text-[#ff3344]">
                Estoque atual: {combatSystem.weapons[1].reserveAmmo} disparos
              </div>
            </div>
            <button
              onClick={handleBuyRifleAmmo}
              disabled={playerCredits < 25}
              className="mt-4 w-full py-2 rounded-xl bg-[#ff3344] hover:bg-[#ff4d5d] disabled:opacity-40 text-black font-extrabold text-xs transition-colors cursor-pointer"
            >
              COMPRAR (+60 MUNIÇÃO)
            </button>
          </div>

          {/* Heavy Plasma Cells */}
          <div className="p-4 rounded-xl bg-[#1c0f12] border border-[#3b171c] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-white">CÉLULAS VIPER HEAVY</span>
                <span className="text-xs font-bold text-[#ffd166]">40 CR</span>
              </div>
              <p className="text-[11px] text-[#9c767a] mb-3">
                12 núcleos energéticos de alta densidade para o canhão de partículas Viper.
              </p>
              <div className="text-[10px] text-[#ff3344]">
                Estoque atual: {combatSystem.weapons[2].reserveAmmo} células
              </div>
            </div>
            <button
              onClick={handleBuyHeavyAmmo}
              disabled={playerCredits < 40}
              className="mt-4 w-full py-2 rounded-xl bg-[#ff3344] hover:bg-[#ff4d5d] disabled:opacity-40 text-black font-extrabold text-xs transition-colors cursor-pointer"
            >
              COMPRAR (+12 CÉLULAS)
            </button>
          </div>

          {/* Armor Vest */}
          <div className="p-4 rounded-xl bg-[#1c0f12] border border-[#3b171c] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-white">BLINDAGEM NÍVEL III</span>
                <span className="text-xs font-bold text-[#ffd166]">35 CR</span>
              </div>
              <p className="text-[11px] text-[#9c767a] mb-3">
                Placas cerâmicas balísticas. Restaura +50 de integridade da armadura corporal.
              </p>
              <div className="text-[10px] text-[#00f2fe]">
                Armadura Atual: {Math.round(combatSystem.armor)} / 100
              </div>
            </div>
            <button
              onClick={handleBuyArmor}
              disabled={playerCredits < 35 || combatSystem.armor >= 100}
              className="mt-4 w-full py-2 rounded-xl bg-[#00f2fe] hover:bg-[#38f5ff] disabled:opacity-40 text-black font-extrabold text-xs transition-colors cursor-pointer"
            >
              REPARAR ARMADURA
            </button>
          </div>

          {/* Nanogel Medkit */}
          <div className="p-4 rounded-xl bg-[#1c0f12] border border-[#3b171c] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-white">KIT MÉDICO NANOGEL</span>
                <span className="text-xs font-bold text-[#ffd166]">20 CR</span>
              </div>
              <p className="text-[11px] text-[#9c767a] mb-3">
                Coagulante celular imediato. Recupera +40 de pontos de vida do personagem.
              </p>
              <div className="text-[10px] text-[#39ff14]">
                Saúde Atual: {Math.round(combatSystem.health)} / 100
              </div>
            </div>
            <button
              onClick={handleBuyMedkit}
              disabled={playerCredits < 20 || combatSystem.health >= 100}
              className="mt-4 w-full py-2 rounded-xl bg-[#39ff14] hover:bg-[#5aff3d] disabled:opacity-40 text-black font-extrabold text-xs transition-colors cursor-pointer"
            >
              APLICAR CURA
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#3d1419] bg-[#220d11] flex items-center justify-between text-xs text-[#b88086]">
          <span>Ammu-Nation Armory · Bairro Comercial</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#ff3344] hover:bg-[#ff4d5d] text-black font-extrabold cursor-pointer"
          >
            FECHAR ARSENAL
          </button>
        </div>
      </div>
    </div>
  );
};
