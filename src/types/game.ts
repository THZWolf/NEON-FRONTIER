export type TileType =
  | 'wall'
  | 'road'
  | 'building'
  | 'tree'
  | 'water'
  | 'crystal'
  | 'scrap'
  | 'ground'
  | 'block';

export interface PlayerState {
  x: number;
  y: number;
  energy: number;
  credits: number;
  materials: number;
  steps: number;
  discoveries: number;
  inVehicle: boolean;
  buildMode: boolean;
  seen: string[];
  world: Record<string, TileType>;
  interacted: number;
  resourcesCollected: number;
}

export interface NPCState {
  id: string;
  name: string;
  x: number;
  y: number;
  mood: string;
  trust: number;
  memory: string[];
  role: string;
  dialoguePool: string[];
}

export interface VehicleState {
  x: number;
  y: number;
}

export interface GameState {
  version: number;
  player: PlayerState;
  npcs: NPCState[];
  vehicle: VehicleState;
  log: string[];
  quest: number;
  playTime: number;
}

export interface ToastNotification {
  id: string;
  text: string;
  type?: 'cyan' | 'pink' | 'amber' | 'default';
}
