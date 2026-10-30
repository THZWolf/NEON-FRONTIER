import React, { useState, useEffect, useRef } from 'react';
import { GameEngine, EngineDiagnostics } from './game3d/core/Engine';
import { NPCInstance } from './game3d/npc/NPCManager';
import { npcMemoryStore } from './game3d/npc/NPCMemory';
import { gameAudio } from './game3d/core/Audio';
import { DistrictVenue } from './game3d/world/CityDistrict';
import { CHARACTER_PROFILES, CharacterProfile } from './game3d/player/CharacterProfiles';

// UI Components
import { GameHUD } from './components/GameHUD';
import { MainMenu } from './components/MainMenu';
import { PauseMenu } from './components/PauseMenu';
import { DialogueModal } from './components/DialogueModal';
import { TerminalModal } from './components/TerminalModal';
import { DiagnosticsOverlay } from './components/DiagnosticsOverlay';
import { ExportModal } from './components/ExportModal';
import { MobileControls3D } from './components/MobileControls3D';

// Activity Modals
import { AutoModModal } from './components/AutoModModal';
import { NightclubModal } from './components/NightclubModal';
import { AmmuNationModal } from './components/AmmuNationModal';
import { HeistBoardModal } from './components/HeistBoardModal';
import { ArcadeModal } from './components/ArcadeModal';
import { CharacterSwitchModal } from './components/CharacterSwitchModal';

export const App: React.FC = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // High-level App & Game States
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'PAUSED'>('MENU');
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(false);

  // Active Modals
  const [activeDialogue, setActiveDialogue] = useState<{
    npc: NPCInstance;
    text: string;
  } | null>(null);
  const [activeTerminalName, setActiveTerminalName] = useState<string | null>(null);
  const [activeVenue, setActiveVenue] = useState<DistrictVenue | null>(null);
  const [showCharacterSwitch, setShowCharacterSwitch] = useState<boolean>(false);

  // Mobile controls state
  const [isSprintingMobile, setIsSprintingMobile] = useState<boolean>(false);

  // Real-time telemetry snapshot
  const [diagnostics, setDiagnostics] = useState<EngineDiagnostics>({
    fps: 60,
    drawCalls: 0,
    triangles: 0,
    playerPos: { x: 0, y: 0, z: 8 },
    npcCount: 5,
    stamina: 100,
    credits: 45,
    health: 100,
    armor: 75,
    wantedStars: 0,
    isDriving: false,
    speedKmh: 0,
    nitro: 100,
    radioStation: 'NEON WAVE 94.7 FM',
    activeWeapon: {
      id: 'arc_rifle',
      name: 'Arc-Rifle NF-7',
      type: 'RIFLE',
      magCapacity: 30,
      currentMag: 30,
      reserveAmmo: 180,
      damage: 42,
      fireRate: 8,
      range: 85,
      icon: 'rifle',
    },
    character: CHARACTER_PROFILES[0],
    timeOfDay: 'NIGHT',
  });

  // 1. Initialize 3D Engine on mount
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const engine = new GameEngine(canvasContainerRef.current);
    engineRef.current = engine;

    // Connect callbacks
    engine.onPromptChange = (prompt) => {
      setInteractionPrompt(prompt);
    };

    engine.onOpenDialogue = (npc, text) => {
      document.exitPointerLock?.();
      setActiveDialogue({ npc, text });
    };

    engine.onOpenTerminal = (name) => {
      document.exitPointerLock?.();
      setActiveTerminalName(name);
    };

    engine.onOpenVenue = (venue) => {
      document.exitPointerLock?.();
      setActiveVenue(venue);
    };

    engine.onOpenCharacterSwitch = () => {
      document.exitPointerLock?.();
      setShowCharacterSwitch(true);
    };

    const onPointerLockChange = () => {
      setIsPointerLocked(!!document.pointerLockElement);
    };
    const onPointerLockError = () => {
      setIsPointerLocked(false);
    };
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('pointerlockerror', onPointerLockError);

    const interval = setInterval(() => {
      if (engineRef.current) {
        setDiagnostics({ ...engineRef.current.diagnostics });
      }
    }, 150);

    return () => {
      clearInterval(interval);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('pointerlockerror', onPointerLockError);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // 2. Global Keyboard Handlers (Esc, F3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        setShowDiagnostics((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        if (activeDialogue) {
          handleCloseDialogue();
          return;
        }
        if (activeTerminalName) {
          handleCloseTerminal();
          return;
        }
        if (activeVenue) {
          setActiveVenue(null);
          return;
        }
        if (showCharacterSwitch) {
          setShowCharacterSwitch(false);
          return;
        }
        if (showExportModal) {
          setShowExportModal(false);
          return;
        }

        if (gameState === 'PLAYING') {
          handlePause();
        } else if (gameState === 'PAUSED') {
          handleResume();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, activeDialogue, activeTerminalName, activeVenue, showCharacterSwitch, showExportModal]);

  // Actions
  const handleStartGame = () => {
    setGameState('PLAYING');
    if (engineRef.current) {
      engineRef.current.start();
      if (canvasContainerRef.current) {
        engineRef.current.player.requestPointerLock(canvasContainerRef.current);
      }
    }
  };

  const handlePause = () => {
    setGameState('PAUSED');
    document.exitPointerLock?.();
    if (engineRef.current) {
      engineRef.current.pause(true);
    }
  };

  const handleResume = () => {
    setGameState('PLAYING');
    if (engineRef.current) {
      engineRef.current.pause(false);
      if (canvasContainerRef.current) {
        engineRef.current.player.requestPointerLock(canvasContainerRef.current);
      }
    }
  };

  const handleResetPosition = () => {
    if (engineRef.current) {
      engineRef.current.player.resetPosition(0, 0, 8);
    }
    handleResume();
  };

  const handleResetMemories = () => {
    try {
      localStorage.removeItem('neon_frontier_3d_npc_memories_v1');
      if (engineRef.current) {
        for (const npc of engineRef.current.npcManager.npcs) {
          npc.trustLevel = 0;
        }
      }
    } catch {
      // safe
    }
    handleResume();
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    gameAudio.enabled = next;
  };

  const handleRequestPointerLock = () => {
    if (canvasContainerRef.current && engineRef.current && gameState === 'PLAYING') {
      engineRef.current.player.requestPointerLock(canvasContainerRef.current);
    }
  };

  const handleCloseDialogue = () => {
    setActiveDialogue(null);
    if (engineRef.current) {
      engineRef.current.setDialogueActive(null);
    }
  };

  const handleCloseTerminal = () => {
    setActiveTerminalName(null);
  };

  const handleUpdateCredits = (newAmount: number) => {
    if (engineRef.current) {
      engineRef.current.player.credits = newAmount;
      setDiagnostics((prev) => ({ ...prev, credits: newAmount }));
    }
  };

  const handleAddCredits = (amount: number) => {
    if (engineRef.current) {
      engineRef.current.player.credits += amount;
      setDiagnostics((prev) => ({ ...prev, credits: engineRef.current!.player.credits }));
    }
  };

  const handleSelectCharacter = (profile: CharacterProfile) => {
    if (engineRef.current) {
      engineRef.current.player.setCharacter(profile);
      setDiagnostics((prev) => ({ ...prev, character: profile }));
    }
  };

  const handleCycleTimeOfDay = () => {
    if (!engineRef.current) return;
    const current = engineRef.current.timeOfDay;
    const next = current === 'NIGHT' ? 'SUNSET' : current === 'SUNSET' ? 'DAY' : 'NIGHT';
    engineRef.current.setTimeOfDay(next);
    setDiagnostics((prev) => ({ ...prev, timeOfDay: next }));
    gameAudio.playInteract();
  };

  // Mobile Virtual input bridge
  const handleMobileMoveStart = (forward: number, strafe: number) => {
    if (engineRef.current) {
      engineRef.current.player.setVirtualInput(forward, strafe, isSprintingMobile);
    }
  };

  const handleMobileMoveEnd = () => {
    if (engineRef.current) {
      engineRef.current.player.setVirtualInput(0, 0, false);
    }
  };

  const handleMobileJump = () => {
    engineRef.current?.player.virtualJump();
  };

  const handleMobileInteract = () => {
    if (!engineRef.current) return;
    if (engineRef.current.currentInteractableVenue) {
      const venue = engineRef.current.currentInteractableVenue;
      gameAudio.playInteract();
      setActiveVenue(venue);
    } else if (engineRef.current.currentInteractableNPC) {
      const npc = engineRef.current.currentInteractableNPC;
      engineRef.current.setDialogueActive(npc.data.id);
      const text = npc.interact();
      setActiveDialogue({ npc, text });
    } else if (engineRef.current.currentInteractableTerminal) {
      const term = engineRef.current.currentInteractableTerminal;
      gameAudio.playInteract();
      engineRef.current.player.credits += 15;
      setActiveTerminalName(term.name);
    } else if (engineRef.current.currentInteractableVehicle || engineRef.current.player.isDriving) {
      engineRef.current.player.onToggleVehicle?.();
    }
  };

  const handleToggleSprintMobile = () => {
    setIsSprintingMobile((prev) => !prev);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#060c18] font-sans">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={canvasContainerRef}
        onClick={handleRequestPointerLock}
        className="w-full h-full cursor-crosshair select-none touch-none"
      />

      {/* Main Game HUD (Active when playing) */}
      {gameState === 'PLAYING' && (
        <>
          <GameHUD
            diagnostics={diagnostics}
            interactionPrompt={interactionPrompt}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onPause={handlePause}
            onToggleDiagnostics={() => setShowDiagnostics((prev) => !prev)}
            showDiagnostics={showDiagnostics}
            isPointerLocked={isPointerLocked}
            onRequestPointerLock={handleRequestPointerLock}
            onOpenCharacterSwitch={() => setShowCharacterSwitch(true)}
            onCycleTimeOfDay={handleCycleTimeOfDay}
          />

          {/* Mobile Touch Controls for small screens */}
          <MobileControls3D
            onMoveStart={handleMobileMoveStart}
            onMoveEnd={handleMobileMoveEnd}
            onJump={handleMobileJump}
            onInteract={handleMobileInteract}
            onToggleSprint={handleToggleSprintMobile}
            isSprinting={isSprintingMobile}
            canInteract={!!interactionPrompt}
          />
        </>
      )}

      {/* Main Start Menu */}
      {gameState === 'MENU' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenExport={() => setShowExportModal(true)}
        />
      )}

      {/* Pause Menu */}
      {gameState === 'PAUSED' && (
        <PauseMenu
          onResume={handleResume}
          onResetPosition={handleResetPosition}
          onOpenExport={() => setShowExportModal(true)}
          onReturnToMainMenu={() => setGameState('MENU')}
          onResetMemories={handleResetMemories}
        />
      )}

      {/* Venue Modals */}
      {activeVenue?.type === 'GARAGE' && (
        <AutoModModal
          vehicle={engineRef.current?.vehicleManager.vehicles[0] || null}
          playerCredits={diagnostics.credits}
          onUpdateCredits={handleUpdateCredits}
          onClose={() => setActiveVenue(null)}
        />
      )}

      {activeVenue?.type === 'NIGHTCLUB' && (
        <NightclubModal onClose={() => setActiveVenue(null)} />
      )}

      {activeVenue?.type === 'AMMUNATION' && engineRef.current && (
        <AmmuNationModal
          combatSystem={engineRef.current.combatSystem}
          playerCredits={diagnostics.credits}
          onUpdateCredits={handleUpdateCredits}
          onClose={() => setActiveVenue(null)}
        />
      )}

      {activeVenue?.type === 'HEIST' && (
        <HeistBoardModal
          playerCredits={diagnostics.credits}
          onAddCredits={handleAddCredits}
          onClose={() => setActiveVenue(null)}
        />
      )}

      {activeVenue?.type === 'ARCADE' && (
        <ArcadeModal
          playerCredits={diagnostics.credits}
          onAddCredits={handleAddCredits}
          onClose={() => setActiveVenue(null)}
        />
      )}

      {activeVenue?.type === 'YACHT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono select-none">
          <div className="relative w-full max-w-xl bg-[#091526] border-2 border-[#00f2fe] rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <h2 className="text-xl font-bold text-white tracking-widest">
              MEGAIATE DE LUXO <span className="text-[#00f2fe]">NEON HORIZON</span>
            </h2>
            <p className="text-xs text-[#8cb4db] leading-relaxed">
              Você embarcou no deck panorâmico do megaiate ancorado na baía de Neon Frontier. Acesso ao
              jacuzzi VIP, heliponto e vista deslumbrante do skyline noturno da metrópole.
            </p>
            <div className="p-3 rounded-xl bg-[#10233b] border border-[#1e3c63] text-xs text-[#ffd166] font-bold">
              +50 Créditos VIP de Fidelidade Concedidos!
            </div>
            <button
              onClick={() => {
                handleAddCredits(50);
                setActiveVenue(null);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#00f2fe] hover:bg-[#38f5ff] text-black font-extrabold text-xs cursor-pointer"
            >
              RETORNAR AO PORTO
            </button>
          </div>
        </div>
      )}

      {/* Character Switcher Modal */}
      {showCharacterSwitch && (
        <CharacterSwitchModal
          currentProfile={diagnostics.character}
          onSelectProfile={handleSelectCharacter}
          onClose={() => setShowCharacterSwitch(false)}
        />
      )}

      {/* Dialogue Modal with NPC */}
      {activeDialogue && (
        <DialogueModal
          npc={activeDialogue.npc}
          initialDialogue={activeDialogue.text}
          playerCredits={diagnostics.credits}
          onUpdateCredits={handleUpdateCredits}
          onClose={handleCloseDialogue}
        />
      )}

      {/* City Data Terminal Modal */}
      {activeTerminalName && (
        <TerminalModal
          terminalName={activeTerminalName}
          playerCredits={diagnostics.credits}
          onAddCredits={handleAddCredits}
          onClose={handleCloseTerminal}
        />
      )}

      {/* Real-time Diagnostics Overlay (F3) */}
      {showDiagnostics && engineRef.current && (
        <DiagnosticsOverlay
          diagnostics={diagnostics}
          npcs={engineRef.current.npcManager.npcs}
          isSoftwareGl={engineRef.current.isSoftwareGl}
          onClose={() => setShowDiagnostics(false)}
        />
      )}

      {/* Source Code Export Modal */}
      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};

export default App;
