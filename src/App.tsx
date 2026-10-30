import React, { useState, useEffect, useRef } from 'react';
import { GameEngine, EngineDiagnostics } from './game3d/core/Engine';
import { NPCInstance } from './game3d/npc/NPCManager';
import { npcMemoryStore } from './game3d/npc/NPCMemory';
import { gameAudio } from './game3d/core/Audio';
import { GameHUD } from './components/GameHUD';
import { MainMenu } from './components/MainMenu';
import { PauseMenu } from './components/PauseMenu';
import { DialogueModal } from './components/DialogueModal';
import { TerminalModal } from './components/TerminalModal';
import { DiagnosticsOverlay } from './components/DiagnosticsOverlay';
import { ExportModal } from './components/ExportModal';
import { MobileControls3D } from './components/MobileControls3D';

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

    // Track pointer lock state changes
    const onPointerLockChange = () => {
      setIsPointerLocked(!!document.pointerLockElement);
    };
    document.addEventListener('pointerlockchange', onPointerLockChange);

    // Diagnostics polling interval
    const interval = setInterval(() => {
      if (engineRef.current) {
        setDiagnostics({ ...engineRef.current.diagnostics });
      }
    }, 200);

    return () => {
      clearInterval(interval);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // 2. Global Keyboard Handlers (Esc, F3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle diagnostics with F3
      if (e.key === 'F3') {
        e.preventDefault();
        setShowDiagnostics((prev) => !prev);
        return;
      }

      // Handle Escape key
      if (e.key === 'Escape') {
        if (activeDialogue) {
          handleCloseDialogue();
          return;
        }
        if (activeTerminalName) {
          handleCloseTerminal();
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
  }, [gameState, activeDialogue, activeTerminalName, showExportModal]);

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
      if (canvasContainerRef.current && gameState === 'PLAYING') {
        engineRef.current.player.requestPointerLock(canvasContainerRef.current);
      }
    }
  };

  const handleCloseTerminal = () => {
    setActiveTerminalName(null);
    if (canvasContainerRef.current && gameState === 'PLAYING' && engineRef.current) {
      engineRef.current.player.requestPointerLock(canvasContainerRef.current);
    }
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
    if (engineRef.current.currentInteractableNPC) {
      const npc = engineRef.current.currentInteractableNPC;
      engineRef.current.setDialogueActive(npc.data.id);
      const text = npc.interact();
      setActiveDialogue({ npc, text });
    } else if (engineRef.current.currentInteractableTerminal) {
      const term = engineRef.current.currentInteractableTerminal;
      gameAudio.playInteract();
      engineRef.current.player.credits += 15;
      setActiveTerminalName(term.name);
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
