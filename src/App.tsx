import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, NPCState, ToastNotification } from './types/game';
import {
  createFreshGameState,
  INITIAL_NPCS,
  QUEST_DEFINITIONS,
  SAVE_KEY,
} from './game/constants';
import { baseTile, coordKey, dist, getTile, hash, isSolid } from './game/worldGen';
import { sound } from './game/audio';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GameCanvas } from './components/GameCanvas';
import { MobileControls } from './components/MobileControls';
import { Toast } from './components/Toast';
import { StartModal, PauseModal, HelpModal, NPCModal } from './components/Modals';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => createFreshGameState());
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<string>('NOVO MUNDO');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hasExistingSave, setHasExistingSave] = useState<boolean>(false);

  // Modals state
  const [showStartModal, setShowStartModal] = useState<boolean>(true);
  const [showPauseModal, setShowPauseModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [activeNPCModal, setActiveNPCModal] = useState<NPCState | null>(null);

  // Toast state
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Game loop & input tracking
  const stateRef = useRef<GameState>(gameState);
  stateRef.current = gameState;

  const isPausedRef = useRef<boolean>(isPaused);
  isPausedRef.current = isPaused;

  const isStartedRef = useRef<boolean>(isStarted);
  isStartedRef.current = isStarted;

  const keysDownRef = useRef<Set<string>>(new Set());
  const moveTimerRef = useRef<number>(0);
  const gamepadPrevRef = useRef<Record<string, boolean>>({});
  const mobileMoveDirectionRef = useRef<'up' | 'down' | 'left' | 'right' | null>(null);

  const showToast = useCallback(
    (text: string, type: 'cyan' | 'pink' | 'amber' | 'default' = 'default') => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToast({ id: String(Date.now()), text, type });
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
      }, 2300);
    },
    []
  );

  // Save to LocalStorage
  const safeSave = useCallback(
    (currentState: GameState) => {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(currentState));
        const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        setSaveStatus(`SALVO ${time}`);
        return true;
      } catch (err) {
        setSaveStatus('SAVE INDISPONÍVEL');
        return false;
      }
    },
    []
  );

  // Load from LocalStorage
  const loadSave = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.player || !Array.isArray(parsed.npcs)) return false;

      const fresh = createFreshGameState();
      const merged: GameState = {
        ...fresh,
        ...parsed,
        player: { ...fresh.player, ...parsed.player },
      };
      setGameState(merged);
      stateRef.current = merged;
      const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setSaveStatus(`CARREGADO ${time}`);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Check saved state on mount
  useEffect(() => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      setHasExistingSave(true);
      setSaveStatus('SAVE ENCONTRADO');
    }
  }, []);

  // Check quest completion
  const checkQuestProgression = useCallback(
    (currentState: GameState) => {
      const currentDef = QUEST_DEFINITIONS[currentState.quest];
      if (currentDef && currentDef.checkComplete(currentState)) {
        if (currentState.quest < QUEST_DEFINITIONS.length - 1) {
          const nextQuest = currentState.quest + 1;
          const nextDef = QUEST_DEFINITIONS[nextQuest];
          sound.playFanfare();
          showToast(`★ Missão Concluída! Novo Objetivo: ${nextDef.title}`, 'amber');
          return {
            ...currentState,
            quest: nextQuest,
            player: {
              ...currentState.player,
              credits: currentState.player.credits + 15,
            },
            log: [`★ Objetivo atingido! Desbloqueado: ${nextDef.title}`, ...currentState.log],
          };
        }
      }
      return currentState;
    },
    [showToast]
  );

  // Explorer movement
  const move = useCallback(
    (dx: number, dy: number) => {
      if (isPausedRef.current || !isStartedRef.current) return;

      setGameState((prev) => {
        const p = { ...prev.player };
        const speed = p.inVehicle ? 2 : 1;
        let moved = false;

        for (let i = 0; i < speed; i++) {
          const nx = p.x + dx;
          const ny = p.y + dy;
          const targetTile = getTile(prev, nx, ny);

          if (isSolid(targetTile)) {
            if (p.inVehicle && i === 0) {
              showToast('Veículo bloqueado por obstáculo', 'pink');
            }
            break;
          }

          p.x = nx;
          p.y = ny;
          p.steps += 1;
          p.energy = Math.max(0, p.energy - 0.035);
          moved = true;

          // Discover sector
          const k = coordKey(nx, ny);
          if (!p.seen.includes(k)) {
            p.seen = [...p.seen, k];
            p.discoveries += 1;
            if (p.discoveries % 5 === 0) {
              p.credits += 8;
              showToast('Novo setor registrado: +8 créditos', 'cyan');
            }
          }

          // NPC proximity greeting
          const nearbyNpc = prev.npcs.find((n) => dist(p, n) <= 1);
          if (nearbyNpc && !nearbyNpc.memory.includes('primeiro encontro')) {
            nearbyNpc.memory = ['primeiro encontro', ...nearbyNpc.memory];
            nearbyNpc.mood = 'atento';
            showToast(`${nearbyNpc.name} percebeu sua presença`, 'pink');
          }
        }

        if (moved) {
          sound.playStep(p.inVehicle);
          let updated: GameState = { ...prev, player: p };
          updated = checkQuestProgression(updated);
          safeSave(updated);
          return updated;
        }

        return prev;
      });
    },
    [checkQuestProgression, safeSave, showToast]
  );

  // Harvest / Collect resources
  const collect = useCallback(() => {
    if (isPausedRef.current || !isStartedRef.current) return;

    setGameState((prev) => {
      const p = { ...prev.player, world: { ...prev.player.world } };
      let found = false;
      let collectedType: 'crystal' | 'scrap' | null = null;

      for (let y = p.y - 2; y <= p.y + 2 && !found; y++) {
        for (let x = p.x - 2; x <= p.x + 2 && !found; x++) {
          if (dist(p, { x, y }) > 2) continue;
          const t = getTile(prev, x, y);

          if (t === 'crystal' || t === 'scrap') {
            p.world[coordKey(x, y)] = 'ground';
            const isCrystal = t === 'crystal';
            p.materials += isCrystal ? 2 : 1;
            p.credits += isCrystal ? 3 : 1;
            p.resourcesCollected += 1;
            found = true;
            collectedType = isCrystal ? 'crystal' : 'scrap';

            showToast(
              isCrystal ? 'Cristal neon coletado: +2 materiais, +3 créditos' : 'Sucata coletada: +1 material, +1 crédito',
              isCrystal ? 'cyan' : 'amber'
            );
          }
        }
      }

      if (found && collectedType) {
        sound.playCollect(collectedType);
        let updated: GameState = {
          ...prev,
          player: p,
          log: [
            collectedType === 'crystal' ? 'Cristal neon sintetizado com sucesso.' : 'Sucata urbana reciclada.',
            ...prev.log,
          ],
        };
        updated = checkQuestProgression(updated);
        safeSave(updated);
        return updated;
      }

      // Radar scan for hidden scrap
      let target: { x: number; y: number } | null = null;
      for (let y = p.y - 3; y <= p.y + 3 && !target; y++) {
        for (let x = p.x - 3; x <= p.x + 3 && !target; x++) {
          if (dist(p, { x, y }) > 3) continue;
          if (baseTile(x, y) === 'ground' && hash(x + 11, y + 19) % 19 === 0) {
            target = { x, y };
          }
        }
      }

      if (target) {
        p.world[coordKey(target.x, target.y)] = 'scrap';
        showToast('Radar: Sinal de sucata detectado nas imediações!', 'amber');
        const updated = { ...prev, player: p };
        safeSave(updated);
        return updated;
      } else {
        showToast('Nenhum recurso próximo. Explore as avenidas iluminadas.', 'default');
        return prev;
      }
    });
  }, [checkQuestProgression, safeSave, showToast]);

  // Talk / Interact with NPC
  const interact = useCallback(
    (targetNPC?: NPCState) => {
      if (isPausedRef.current || !isStartedRef.current) return;

      setGameState((prev) => {
        const p = { ...prev.player };
        const npc = targetNPC || prev.npcs.find((n) => dist(p, n) <= 2);

        if (!npc) {
          showToast('Aproxime-se de um cidadão para conversar.', 'default');
          return prev;
        }

        const npcs = prev.npcs.map((n) => {
          if (n.id !== npc.id) return n;
          const trust = n.trust + 1;
          const memory = [`Interação ${trust}: diálogo com explorador`, ...n.memory].slice(0, 8);
          const mood = trust >= 3 ? 'aliado' : 'receptivo';
          return { ...n, trust, memory, mood };
        });

        p.interacted += 1;
        p.credits += 4;

        const updatedNpc = npcs.find((n) => n.id === npc.id)!;
        const dialogue = updatedNpc.dialoguePool[(updatedNpc.trust - 1) % updatedNpc.dialoguePool.length];

        sound.playInteract();
        showToast(`Conversou com ${npc.name}: +4 créditos`, 'pink');

        let updated: GameState = {
          ...prev,
          player: p,
          npcs,
          log: [`${npc.name}: ${dialogue}`, ...prev.log],
        };

        updated = checkQuestProgression(updated);
        safeSave(updated);
        return updated;
      });
    },
    [checkQuestProgression, safeSave, showToast]
  );

  // Toggle build mode
  const toggleBuild = useCallback(() => {
    if (isPausedRef.current || !isStartedRef.current) return;

    setGameState((prev) => {
      const nextMode = !prev.player.buildMode;
      showToast(nextMode ? 'Modo Construção ativado' : 'Modo Exploração ativado', 'cyan');
      const updated = {
        ...prev,
        player: { ...prev.player, buildMode: nextMode },
      };
      safeSave(updated);
      return updated;
    });
  }, [safeSave, showToast]);

  // Build / Dismantle block at coordinate
  const buildAt = useCallback(
    (x: number, y: number) => {
      if (isPausedRef.current || !isStartedRef.current) return;

      setGameState((prev) => {
        const p = { ...prev.player, world: { ...prev.player.world } };
        if (!p.buildMode) return prev;

        if (dist(p, { x, y }) > 4) {
          showToast('Construção limitada a 4 blocos de distância', 'pink');
          return prev;
        }

        const k = coordKey(x, y);
        const currentTile = getTile(prev, x, y);

        // Remove existing block
        if (p.world[k] === 'block') {
          delete p.world[k];
          p.materials += 1;
          sound.playBuild('remove');
          showToast('Bloco desmontado: +1 material recuperado', 'amber');
          let updated: GameState = {
            ...prev,
            player: p,
            log: ['Bloco desconstruído na fronteira.', ...prev.log],
          };
          updated = checkQuestProgression(updated);
          safeSave(updated);
          return updated;
        }

        // Place new block
        const isOccupiedByPlayer = p.x === x && p.y === y;
        const isOccupiedByNpc = prev.npcs.some((n) => n.x === x && n.y === y);
        const isOccupiedByVehicle = prev.vehicle.x === x && prev.vehicle.y === y;

        if (
          p.materials > 0 &&
          !isSolid(currentTile) &&
          !isOccupiedByPlayer &&
          !isOccupiedByNpc &&
          !isOccupiedByVehicle
        ) {
          p.world[k] = 'block';
          p.materials -= 1;
          sound.playBuild('place');
          showToast('Bloco de neon construído!', 'cyan');
          let updated: GameState = {
            ...prev,
            player: p,
            log: ['Novo módulo de construção erguido.', ...prev.log],
          };
          updated = checkQuestProgression(updated);
          safeSave(updated);
          return updated;
        } else {
          showToast(
            p.materials <= 0 ? 'Sem materiais suficientes. Use Q para coletar.' : 'Posição indisponível para construção.',
            'pink'
          );
          return prev;
        }
      });
    },
    [checkQuestProgression, safeSave, showToast]
  );

  // Toggle vehicle entry / exit
  const toggleVehicle = useCallback(() => {
    if (isPausedRef.current || !isStartedRef.current) return;

    setGameState((prev) => {
      const p = { ...prev.player };
      const v = { ...prev.vehicle };

      if (p.inVehicle) {
        p.inVehicle = false;
        v.x = p.x;
        v.y = p.y;
        sound.playVehicleToggle(false);
        showToast('Você desembarcou do veículo', 'default');
      } else if (dist(p, v) <= 2) {
        p.inVehicle = true;
        sound.playVehicleToggle(true);
        showToast('Veículo hover ativado: velocidade duplicada!', 'cyan');
      } else {
        showToast('Aproxime-se do veículo marcado no mapa.', 'pink');
        return prev;
      }

      const updated = { ...prev, player: p, vehicle: v };
      safeSave(updated);
      return updated;
    });
  }, [safeSave, showToast]);

  // Pause / Resume controllers
  const pauseGame = useCallback(() => {
    setIsPaused(true);
    setShowPauseModal(true);
  }, []);

  const resumeGame = useCallback(() => {
    setIsStarted(true);
    setIsPaused(false);
    setShowStartModal(false);
    setShowPauseModal(false);
    setShowHelpModal(false);
  }, []);

  const startNewGame = useCallback(() => {
    const fresh = createFreshGameState();
    setGameState(fresh);
    stateRef.current = fresh;
    safeSave(fresh);
    setIsStarted(true);
    setIsPaused(false);
    setShowStartModal(false);
    setShowPauseModal(false);
    setShowHelpModal(false);
    showToast('Novo mundo neon iniciado. Explore a cidade!', 'cyan');
  }, [safeSave, showToast]);

  const continueGame = useCallback(() => {
    if (loadSave()) {
      setIsStarted(true);
      setIsPaused(false);
      setShowStartModal(false);
      setShowPauseModal(false);
      setShowHelpModal(false);
      showToast('Save carregado com sucesso!', 'cyan');
    } else {
      startNewGame();
    }
  }, [loadSave, showToast, startNewGame]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        e.preventDefault();
      }

      if (key === 'escape') {
        if (!isPausedRef.current) {
          pauseGame();
        } else if (isStartedRef.current) {
          resumeGame();
        }
        return;
      }

      if (key === 'enter' && isPausedRef.current) {
        resumeGame();
        return;
      }

      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        keysDownRef.current.add(key);
        return;
      }

      if (e.repeat) return;

      if (key === 'e') interact();
      else if (key === 'b') toggleBuild();
      else if (key === 'f') toggleVehicle();
      else if (key === 'q') collect();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current.delete(e.key.toLowerCase());
    };

    const handleBlur = () => {
      keysDownRef.current.clear();
      if (isStartedRef.current && !isPausedRef.current) {
        pauseGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [collect, interact, pauseGame, resumeGame, toggleBuild, toggleVehicle]);

  // Main game tick: smooth movement loop & gamepad input
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = (timestamp: number) => {
      if (!isPausedRef.current && isStartedRef.current) {
        // 1. Process keyboard & mobile dpad movement
        let dx = 0;
        let dy = 0;
        const keys = keysDownRef.current;
        const mobileDir = mobileMoveDirectionRef.current;

        if (keys.has('w') || keys.has('arrowup') || mobileDir === 'up') dy = -1;
        else if (keys.has('s') || keys.has('arrowdown') || mobileDir === 'down') dy = 1;

        if (keys.has('a') || keys.has('arrowleft') || mobileDir === 'left') dx = -1;
        else if (keys.has('d') || keys.has('arrowright') || mobileDir === 'right') dx = 1;

        // 2. Poll Gamepad API
        try {
          const pads = navigator.getGamepads?.();
          const gp = pads && Array.from(pads).find(Boolean);
          if (gp) {
            const axes = gp.axes || [];
            const buttons = gp.buttons || [];

            if (axes[0] < -0.45 || buttons[14]?.pressed) dx = -1;
            else if (axes[0] > 0.45 || buttons[15]?.pressed) dx = 1;

            if (axes[1] < -0.45 || buttons[12]?.pressed) dy = -1;
            else if (axes[1] > 0.45 || buttons[13]?.pressed) dy = 1;

            const actions: [string, number, () => void][] = [
              ['interact', 0, () => interact()],
              ['vehicle', 1, () => toggleVehicle()],
              ['build', 2, () => toggleBuild()],
              ['collect', 3, () => collect()],
            ];

            for (const [name, index, fn] of actions) {
              const pressed = !!buttons[index]?.pressed;
              if (pressed && !gamepadPrevRef.current[name]) {
                fn();
              }
              gamepadPrevRef.current[name] = pressed;
            }
          }
        } catch {
          // Ignore gamepad error
        }

        if (dx !== 0 || dy !== 0) {
          if (timestamp - moveTimerRef.current > 120) {
            move(dx, dy);
            moveTimerRef.current = timestamp;
          }
        }
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [collect, interact, move, toggleBuild, toggleVehicle]);

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#080d18] text-[#eaf5ff] overflow-hidden select-none font-sans">
      {/* HEADER */}
      <Header
        saveStatus={saveStatus}
        isPaused={isPaused}
        soundEnabled={soundEnabled}
        onTogglePause={() => (isPaused ? resumeGame() : pauseGame())}
        onToggleSound={() => {
          const next = sound.toggleMute();
          setSoundEnabled(next);
          showToast(next ? 'Áudio ativado' : 'Áudio silenciado', 'default');
        }}
        onOpenMenu={() => {
          pauseGame();
          setShowStartModal(true);
        }}
      />

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col lg:flex-row gap-2.5 p-2.5 max-w-[1700px] w-full mx-auto overflow-hidden relative">
        {/* GAME WORLD CANVAS */}
        <section className="relative flex-1 flex flex-col min-h-0 min-w-0">
          <GameCanvas
            state={gameState}
            onBuildAt={buildAt}
            isPaused={isPaused}
          />

          <Toast toast={toast} />

          <MobileControls
            onMoveStart={(direction) => {
              mobileMoveDirectionRef.current = direction;
            }}
            onMoveEnd={() => {
              mobileMoveDirectionRef.current = null;
            }}
            onInteract={() => interact()}
            onBuild={toggleBuild}
            onVehicle={toggleVehicle}
            onCollect={collect}
            buildMode={gameState.player.buildMode}
            inVehicle={gameState.player.inVehicle}
          />
        </section>

        {/* SIDEBAR PANEL */}
        <Sidebar
          state={gameState}
          onInteract={() => interact()}
          onToggleBuild={toggleBuild}
          onToggleVehicle={toggleVehicle}
          onCollect={collect}
          onSave={() => {
            safeSave(gameState);
            showToast('Progresso salvo manualmente!', 'cyan');
          }}
          onNewWorld={() => {
            if (window.confirm('Criar um novo mundo? O progresso salvo atual será substituído.')) {
              startNewGame();
            }
          }}
          onSelectNPC={(npc) => {
            setActiveNPCModal(npc);
          }}
        />
      </main>

      {/* MODALS */}
      <StartModal
        isOpen={showStartModal}
        hasSave={hasExistingSave}
        onStartNew={startNewGame}
        onContinue={continueGame}
        onOpenHelp={() => {
          setShowStartModal(false);
          setShowHelpModal(true);
        }}
      />

      <PauseModal
        isOpen={showPauseModal && !showStartModal && !showHelpModal}
        onResume={resumeGame}
        onSave={() => {
          safeSave(gameState);
          showToast('Progresso salvo com sucesso!', 'cyan');
        }}
        onOpenMenu={() => {
          setShowPauseModal(false);
          setShowStartModal(true);
        }}
        onOpenHelp={() => {
          setShowPauseModal(false);
          setShowHelpModal(true);
        }}
      />

      <HelpModal
        isOpen={showHelpModal}
        onClose={() => {
          setShowHelpModal(false);
          if (!isStarted) setShowStartModal(true);
        }}
      />

      <NPCModal
        npc={activeNPCModal}
        onClose={() => setActiveNPCModal(null)}
        onInteract={(npc) => {
          interact(npc);
          setActiveNPCModal(null);
        }}
      />
    </div>
  );
};

export default App;
