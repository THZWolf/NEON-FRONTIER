import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState } from '../types/game';
import { TILE_SIZE } from '../game/constants';
import { baseTile, coordKey, dist, getSectorName, getTile, hash, isSolid } from '../game/worldGen';

interface GameCanvasProps {
  state: GameState;
  onBuildAt: (x: number, y: number) => void;
  isPaused: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ state, onBuildAt, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number; id: number } | null>(null);

  // Coordinate converter
  const screenToTile = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const cssW = rect.width;
      const cssH = rect.height;

      const p = state.player;
      const zoom = Math.min(cssW / 19, cssH / 13);
      const camX = p.x * TILE_SIZE + TILE_SIZE / 2 - cssW / 2;
      const camY = p.y * TILE_SIZE + TILE_SIZE / 2 - cssH / 2;

      const relX = clientX - rect.left;
      const relY = clientY - rect.top;

      const tileX = Math.floor((relX / (zoom / TILE_SIZE) + camX) / TILE_SIZE);
      const tileY = Math.floor((relY / (zoom / TILE_SIZE) + camY) / TILE_SIZE);

      return { x: tileX, y: tileY };
    },
    [state.player]
  );

  // Main rendering routine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const cssW = Math.max(1, rect.width);
    const cssH = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background
    ctx.fillStyle = '#07101b';
    ctx.fillRect(0, 0, cssW, cssH);

    const p = state.player;
    const zoom = Math.min(cssW / 19, cssH / 13);
    const tileSize = zoom;
    const scale = tileSize / TILE_SIZE;

    const camX = p.x * TILE_SIZE + TILE_SIZE / 2 - cssW / 2;
    const camY = p.y * TILE_SIZE + TILE_SIZE / 2 - cssH / 2;

    const left = Math.floor(camX / TILE_SIZE) - 1;
    const top = Math.floor(camY / TILE_SIZE) - 1;
    const right = left + Math.ceil(cssW / tileSize) + 3;
    const bottom = top + Math.ceil(cssH / tileSize) + 3;

    ctx.save();
    ctx.translate(-camX * scale, -camY * scale);
    ctx.scale(scale, scale);

    // 1. Draw tiles
    for (let y = top; y <= bottom; y++) {
      for (let x = left; x <= right; x++) {
        const t = getTile(state, x, y);
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        let color = '#102b35';
        if (t === 'road') color = '#202d42';
        else if (t === 'building') color = '#24334b';
        else if (t === 'tree') color = '#123c39';
        else if (t === 'water') color = '#12314a';
        else if (t === 'wall') color = '#0a111d';
        else if (t === 'block') color = '#17646b';
        else if (t === 'crystal') color = '#194a62';
        else if (t === 'scrap') color = '#4a3b31';

        ctx.fillStyle = color;
        ctx.fillRect(px, py, TILE_SIZE - 1, TILE_SIZE - 1);

        // Road markings
        if (t === 'road') {
          ctx.fillStyle = '#52647a';
          ctx.globalAlpha = 0.45;
          if (x % 13 === 0) {
            ctx.fillRect(px + 15, py + 4, 2, 8);
            ctx.fillRect(px + 15, py + 20, 2, 8);
          } else {
            ctx.fillRect(px + 4, py + 15, 8, 2);
            ctx.fillRect(px + 20, py + 15, 8, 2);
          }
          ctx.globalAlpha = 1;
        }

        // Cyber building with lit windows
        if (t === 'building') {
          ctx.fillStyle = '#53dcd1';
          ctx.globalAlpha = 0.6;
          for (const [ox, oy] of [
            [5, 5],
            [19, 5],
            [5, 19],
            [19, 19],
          ]) {
            ctx.fillRect(px + ox, py + oy, 6, 6);
          }
          ctx.globalAlpha = 1;
          ctx.strokeStyle = '#364c67';
          ctx.strokeRect(px + 2, py + 2, 27, 27);
        }

        // Tree
        if (t === 'tree') {
          ctx.fillStyle = '#1c6d63';
          ctx.beginPath();
          ctx.arc(px + 16, py + 14, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#654d3e';
          ctx.fillRect(px + 14, py + 20, 4, 9);
        }

        // Water ripple lines
        if (t === 'water') {
          ctx.strokeStyle = '#357a96';
          ctx.beginPath();
          ctx.moveTo(px + 5, py + 13);
          ctx.lineTo(px + 24, py + 13);
          ctx.moveTo(px + 8, py + 22);
          ctx.lineTo(px + 19, py + 22);
          ctx.stroke();
        }

        // Player placed blocks
        if (t === 'block') {
          ctx.strokeStyle = '#a1fff2';
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 4, py + 4, 24, 24);
          ctx.lineWidth = 1;
        }

        // Harvestable crystal
        if (t === 'crystal') {
          ctx.fillStyle = '#70f7f0';
          ctx.beginPath();
          ctx.moveTo(px + 16, py + 4);
          ctx.lineTo(px + 25, py + 16);
          ctx.lineTo(px + 16, py + 27);
          ctx.lineTo(px + 7, py + 16);
          ctx.closePath();
          ctx.fill();
        }

        // Harvestable scrap
        if (t === 'scrap') {
          ctx.fillStyle = '#f2b36e';
          ctx.fillRect(px + 7, py + 10, 18, 12);
          ctx.strokeStyle = '#ffdf9c';
          ctx.strokeRect(px + 7, py + 10, 18, 12);
        }
      }
    }

    // 2. Undiscovered Resource Beacons (deterministic)
    for (let y = top; y <= bottom; y++) {
      for (let x = left; x <= right; x++) {
        if (baseTile(x, y) === 'ground') {
          const h = hash(x + 101, y + 301) % 311;
          if (h === 7 || h === 19) {
            const k = coordKey(x, y);
            if (!p.world[k]) {
              ctx.fillStyle = h === 7 ? '#66f4e8' : '#f2b36e';
              ctx.globalAlpha = 0.85;
              ctx.beginPath();
              ctx.arc(x * TILE_SIZE + 16, y * TILE_SIZE + 16, 4, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          }
        }
      }
    }

    // 3. Build Mode Targeting Grid Preview
    if (p.buildMode && hoveredTile) {
      const hx = hoveredTile.x;
      const hy = hoveredTile.y;
      const distance = dist(p, { x: hx, y: hy });
      const inRange = distance <= 4;
      const t = getTile(state, hx, hy);
      const isRemovable = t === 'block';
      const isPlacable =
        !isSolid(t) &&
        !(p.x === hx && p.y === hy) &&
        !state.npcs.some((n) => n.x === hx && n.y === hy) &&
        !(state.vehicle.x === hx && state.vehicle.y === hy);

      if (inRange) {
        ctx.lineWidth = 2;
        if (isRemovable) {
          ctx.strokeStyle = '#ff5fa2';
          ctx.strokeRect(hx * TILE_SIZE + 2, hy * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        } else if (isPlacable) {
          ctx.strokeStyle = '#66f4e8';
          ctx.strokeRect(hx * TILE_SIZE + 2, hy * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        } else {
          ctx.strokeStyle = '#ff4444';
          ctx.strokeRect(hx * TILE_SIZE + 2, hy * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        }
        ctx.lineWidth = 1;
      }
    }

    // 4. Draw NPCs
    for (const n of state.npcs) {
      const isClose = dist(p, n) <= 2;
      ctx.fillStyle = n.trust >= 3 ? '#ffd166' : '#ff5fa2';
      ctx.beginPath();
      ctx.arc(n.x * TILE_SIZE + 16, n.y * TILE_SIZE + 16, 8, 0, Math.PI * 2);
      ctx.fill();

      // Name tag
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "JetBrains Mono", system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(n.name, n.x * TILE_SIZE + 16, n.y * TILE_SIZE + 5);

      // Speech prompt indicator if close
      if (isClose) {
        ctx.fillStyle = '#66f4e8';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('[E]', n.x * TILE_SIZE + 16, n.y * TILE_SIZE + 29);
      }
    }

    // 5. Draw Vehicle
    const v = state.vehicle;
    ctx.fillStyle = '#0b141f';
    ctx.fillRect(v.x * TILE_SIZE + 3, v.y * TILE_SIZE + 7, 26, 18);
    ctx.fillStyle = '#65f4e8';
    ctx.fillRect(v.x * TILE_SIZE + 6, v.y * TILE_SIZE + 9, 20, 6);
    ctx.fillStyle = '#90b9d4';
    ctx.fillRect(v.x * TILE_SIZE + 6, v.y * TILE_SIZE + 19, 5, 4);
    ctx.fillRect(v.x * TILE_SIZE + 21, v.y * TILE_SIZE + 19, 5, 4);

    // If near vehicle and not inside, show prompt
    if (!p.inVehicle && dist(p, v) <= 2) {
      ctx.fillStyle = '#66f4e8';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[F]', v.x * TILE_SIZE + 16, v.y * TILE_SIZE + 4);
    }

    // 6. Draw Player
    if (!p.inVehicle) {
      ctx.fillStyle = '#66f4e8';
      ctx.beginPath();
      ctx.arc(p.x * TILE_SIZE + 16, p.y * TILE_SIZE + 16, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#07121c';
      ctx.fillRect(p.x * TILE_SIZE + 13, p.y * TILE_SIZE + 13, 6, 6);
    }

    // Build mode player bounding ring
    if (p.buildMode) {
      ctx.strokeStyle = '#66f4e8';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x * TILE_SIZE - 4, p.y * TILE_SIZE - 4, TILE_SIZE + 8, TILE_SIZE + 8);
      ctx.lineWidth = 1;
    }

    ctx.restore();

    // 7. Compact In-World Cyberpunk Legend / Sector HUD
    ctx.fillStyle = '#07101bee';
    ctx.fillRect(10, 10, Math.min(270, cssW - 20), 44);
    ctx.strokeStyle = '#263b56';
    ctx.strokeRect(10, 10, Math.min(270, cssW - 20), 44);

    ctx.fillStyle = '#d9efff';
    ctx.font = 'bold 11px "JetBrains Mono", system-ui';
    ctx.textAlign = 'left';

    const statusText = p.inVehicle
      ? 'VEÍCULO HOVER ATIVO · 2x velocidade'
      : p.buildMode
      ? 'MODO CONSTRUÇÃO · raio de 4 blocos'
      : getSectorName(p.x, p.y);

    ctx.fillText(statusText, 20, 27);

    ctx.fillStyle = '#8ba6c2';
    ctx.font = '10px "JetBrains Mono", system-ui';
    ctx.fillText('◈ Cristais   ▪ Sucata   ● Cidadãos', 20, 42);
  }, [state, hoveredTile]);

  // Pointer event handlers for building
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (state.player.buildMode) {
      const tile = screenToTile(e.clientX, e.clientY);
      setHoveredTile(tile);
    } else if (hoveredTile) {
      setHoveredTile(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointerStartRef.current) return;
    const moved = Math.hypot(
      e.clientX - pointerStartRef.current.x,
      e.clientY - pointerStartRef.current.y
    );
    pointerStartRef.current = null;

    if (moved < 12 && state.player.buildMode) {
      const tile = screenToTile(e.clientX, e.clientY);
      if (tile) {
        onBuildAt(tile.x, tile.y);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full h-full min-h-[300px] overflow-hidden rounded-xl border border-[#253b57] bg-[#07101b] shadow-[0_12px_50px_rgba(0,0,0,0.35)]"
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => setHoveredTile(null)}
        className="w-full h-full block cursor-crosshair outline-none touch-none"
        aria-label="Mundo do jogo Neon Frontier"
      />
    </div>
  );
};
