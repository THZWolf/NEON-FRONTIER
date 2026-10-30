import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Trophy, RotateCcw, X, Play, ArrowLeft, ArrowRight } from 'lucide-react';
import { gameAudio } from '../game3d/core/Audio';

interface ArcadeModalProps {
  playerCredits: number;
  onAddCredits: (amount: number) => void;
  onClose: () => void;
}

export const ArcadeModal: React.FC<ArcadeModalProps> = ({
  playerCredits,
  onAddCredits,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(1480);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let shipX = canvas.width / 2;
    const shipWidth = 32;
    const shipHeight = 24;

    interface Bullet {
      x: number;
      y: number;
    }
    interface Obstacle {
      x: number;
      y: number;
      width: number;
      height: number;
      speed: number;
      color: string;
    }

    let bullets: Bullet[] = [];
    let obstacles: Obstacle[] = [];
    let currentScore = 0;
    let animId = 0;
    let spawnTimer = 0;

    const keys: Record<string, boolean> = {};

    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if (e.key === ' ' || e.key === 'ArrowUp') {
        bullets.push({ x: shipX, y: canvas.height - 40 });
        gameAudio.playLaserShot(false);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const loop = () => {
      // Clear screen
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield parallax
      ctx.fillStyle = '#00f2fe33';
      for (let i = 0; i < 20; i++) {
        const sx = (i * 37 + (performance.now() * 0.1)) % canvas.width;
        const sy = (i * 29 + (performance.now() * 0.2)) % canvas.height;
        ctx.fillRect(sx, sy, 2, 2);
      }

      // Ship controls
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        shipX = Math.max(shipWidth / 2, shipX - 5);
      }
      if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        shipX = Math.min(canvas.width - shipWidth / 2, shipX + 5);
      }

      // Draw Ship
      ctx.fillStyle = '#00f2fe';
      ctx.beginPath();
      ctx.moveTo(shipX, canvas.height - 45);
      ctx.lineTo(shipX - shipWidth / 2, canvas.height - 20);
      ctx.lineTo(shipX, canvas.height - 26);
      ctx.lineTo(shipX + shipWidth / 2, canvas.height - 20);
      ctx.closePath();
      ctx.fill();

      // Bullets
      ctx.fillStyle = '#ff00aa';
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y -= 7;
        ctx.fillRect(b.x - 2, b.y, 4, 10);
        if (b.y < -10) {
          bullets.splice(i, 1);
        }
      }

      // Spawn obstacles
      spawnTimer++;
      if (spawnTimer % 40 === 0) {
        const w = 24 + Math.random() * 20;
        obstacles.push({
          x: Math.random() * (canvas.width - w),
          y: -20,
          width: w,
          height: 18,
          speed: 2 + Math.random() * 2.5,
          color: Math.random() > 0.5 ? '#ff3344' : '#ffd166',
        });
      }

      // Update & Draw obstacles
      for (let oi = obstacles.length - 1; oi >= 0; oi--) {
        const obs = obstacles[oi];
        obs.y += obs.speed;

        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Check bullet hit
        for (let bi = bullets.length - 1; bi >= 0; bi--) {
          const b = bullets[bi];
          if (
            b.x >= obs.x &&
            b.x <= obs.x + obs.width &&
            b.y >= obs.y &&
            b.y <= obs.y + obs.height
          ) {
            obstacles.splice(oi, 1);
            bullets.splice(bi, 1);
            currentScore += 50;
            setScore(currentScore);
            gameAudio.playImpactSound();
            break;
          }
        }

        // Check ship collision
        if (
          obs.y + obs.height >= canvas.height - 40 &&
          obs.x + obs.width >= shipX - shipWidth / 2 &&
          obs.x <= shipX + shipWidth / 2
        ) {
          setGameOver(true);
          setIsPlaying(false);
          gameAudio.playLand();
          if (currentScore > highScore) {
            setHighScore(currentScore);
            onAddCredits(Math.round(currentScore / 20));
          }
          return;
        }

        // Cleanup
        if (obs.y > canvas.height + 20) {
          obstacles.splice(oi, 1);
          currentScore += 10;
          setScore(currentScore);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isPlaying]);

  const handleStart = () => {
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    gameAudio.playInteract();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono select-none">
      <div className="relative w-full max-w-2xl bg-[#090b14] border-2 border-[#00f2fe] rounded-2xl shadow-[0_0_40px_rgba(0,242,254,0.35)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b2d49] bg-[#0f1728]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00f2fe]/20 border border-[#00f2fe]/50 text-[#00f2fe]">
              <Gamepad2 size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                ARCADE <span className="text-[#00f2fe]">198X</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40">
                  NEON FIGHTER
                </span>
              </h2>
              <p className="text-xs text-[#7090b8]">Gabinete clássico de fliperama dos anos 80 em Neon Frontier</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#142338] hover:bg-[#1f3757] text-[#9fc2e8] hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center space-y-4">
          <div className="flex items-center justify-between w-full max-w-lg px-2 text-xs">
            <div className="text-white font-bold">
              PONTUAÇÃO: <span className="text-[#00f2fe]">{score}</span>
            </div>
            <div className="text-[#ffd166] font-bold flex items-center gap-1.5">
              <Trophy size={14} />
              RECORDE: {highScore}
            </div>
          </div>

          {/* Retro Canvas */}
          <div className="relative border-4 border-[#162740] rounded-xl overflow-hidden shadow-2xl bg-[#060a14]">
            <canvas ref={canvasRef} width={480} height={320} className="block w-full max-w-[480px] h-[320px]" />

            {!isPlaying && (
              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-6 text-center space-y-4">
                {gameOver ? (
                  <>
                    <div className="text-xl font-black text-[#ff3344] tracking-wider animate-bounce">
                      GAME OVER
                    </div>
                    <div className="text-xs text-white">Sua pontuação: {score}</div>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-black text-[#00f2fe] tracking-widest">
                      NEON INTERCEPTOR
                    </div>
                    <p className="text-xs text-[#82a3c7] max-w-xs">
                      Use as setas [← / →] ou [A / D] para mover sua nave espacial e [ESPAÇO] para disparar laser.
                    </p>
                  </>
                )}

                <button
                  onClick={handleStart}
                  className="px-6 py-2.5 rounded-xl bg-[#00f2fe] hover:bg-[#38f5ff] text-black font-extrabold text-sm flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,242,254,0.4)]"
                >
                  <Play size={16} />
                  {gameOver ? 'JOGAR NOVAMENTE' : 'INICIAR PARTIDA'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1b2d49] bg-[#0f1728] flex items-center justify-between text-xs text-[#7090b8]">
          <span>Gabinete Arcade-198X · Setor Sul</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#142338] hover:bg-[#1f3757] text-white text-xs font-bold cursor-pointer"
          >
            VOLTAR AO JOGO
          </button>
        </div>
      </div>
    </div>
  );
};
