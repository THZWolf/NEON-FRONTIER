import { MAP_HEIGHT, MAP_WIDTH } from './constants';
import { GameState, TileType } from '../types/game';

export const coordKey = (x: number, y: number): string => `${x},${y}`;

export function parseCoordKey(key: string): { x: number; y: number } {
  const [x, y] = key.split(',').map(Number);
  return { x: x || 0, y: y || 0 };
}

export function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function hash(x: number, y: number): number {
  let n = (x * 374761393 + y * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return (n ^ (n >>> 16)) >>> 0;
}

export function baseTile(x: number, y: number): TileType {
  if (x < 0 || y < 0 || x >= MAP_WIDTH || y >= MAP_HEIGHT) return 'wall';
  if (x === 0 || y === 0 || x === MAP_WIDTH - 1 || y === MAP_HEIGHT - 1) return 'wall';

  const isRoad = x % 13 === 0 || y % 11 === 0 || ((x + 4) % 29 === 0 && y % 3 < 2);
  if (isRoad) return 'road';

  const h = hash(x, y) % 100;
  if (h < 7) return 'water';
  if (h < 17) return 'building';
  if (h < 22) return 'tree';

  const resource = hash(x + 101, y + 301) % 311;
  if (resource === 7) return 'crystal';
  if (resource === 19) return 'scrap';

  return 'ground';
}

export function getTile(state: GameState, x: number, y: number): TileType {
  const override = state.player.world[coordKey(x, y)];
  return override || baseTile(x, y);
}

export function isSolid(tile: TileType): boolean {
  return ['wall', 'water', 'building', 'tree'].includes(tile);
}

export function getSectorName(x: number, y: number): string {
  const sx = Math.floor(x / 10) + 1;
  const sy = Math.floor(y / 10) + 1;
  const sectorNames = [
    'Centro Neon',
    'Setor Lótus',
    'Plaza Tecnológica',
    'Porto Norte',
    'Avenida Prisma',
    'Distrito Quântico',
    'Complexo Industrial',
    'Cúpula Cibernética',
    'Fronteira Livre',
    'Bairro Sintético',
  ];
  const name = sectorNames[(sx * 3 + sy * 7) % sectorNames.length];
  return `Setor ${sx}-${sy} (${name})`;
}
