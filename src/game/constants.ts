import { GameState, NPCState } from '../types/game';

export const TILE_SIZE = 32;
export const MAP_WIDTH = 100;
export const MAP_HEIGHT = 80;
export const SAVE_KEY = 'neon-frontier-v1';

export const INITIAL_NPCS: NPCState[] = [
  {
    id: 'mira',
    name: 'Mira',
    x: 15,
    y: 12,
    mood: 'curiosa',
    trust: 0,
    memory: [],
    role: 'Engenheira de Sistemas',
    dialoguePool: [
      '“A cidade muda quando alguém presta atenção.”',
      '“Os cristais neon têm uma ressonância harmônica pura.”',
      '“Se construir perto da encruzilhada, podemos montar uma oficina comunitária!”',
      '“Sinto que podemos reconstruir toda esta rede juntos.”',
    ],
  },
  {
    id: 'sol',
    name: 'Sol',
    x: 36,
    y: 28,
    mood: 'reservado',
    trust: 0,
    memory: [],
    role: 'Operador de Frequência',
    dialoguePool: [
      '“As velhas torres ainda transmitem pulsos de dados para o horizonte.”',
      '“O silêncio do setor oriental guarda segredos de antes do apagão.”',
      '“Você provou ser de confiança. Leve este sinal de dados para suas viagens.”',
      '“Poucos chegam tão longe na fronteira. Obrigado por passar aqui.”',
    ],
  },
  {
    id: 'kai',
    name: 'Kai',
    x: 61,
    y: 19,
    mood: 'observador',
    trust: 0,
    memory: [],
    role: 'Cartógrafo Noturno',
    dialoguePool: [
      '“Mapear a fronteira é o primeiro passo para reconstruí-la.”',
      '“As estradas principais permitem acelerar muito com o veículo hover.”',
      '“Cada setor registrado na memória é uma vitória sobre o esquecimento.”',
      '“Você já se tornou a maior lenda viva deste quadrante!”',
    ],
  },
  {
    id: 'nix',
    name: 'Nix',
    x: 74,
    y: 53,
    mood: 'criativa',
    trust: 0,
    memory: [],
    role: 'Sintetizadora de Artefatos',
    dialoguePool: [
      '“Sucata brilhante nas mãos certas vira tecnologia de ponta.”',
      '“Construa refúgios ao longo da rota. A noite neon pode ser longa.”',
      '“A energia dos cristais abastece nossos módulos com eficiência máxima.”',
      '“Que honra criar ao seu lado, pioneiro da Fronteira.”',
    ],
  },
];

export const createFreshGameState = (): GameState => ({
  version: 1,
  player: {
    x: 8,
    y: 8,
    energy: 100,
    credits: 25,
    materials: 6,
    steps: 0,
    discoveries: 0,
    inVehicle: false,
    buildMode: false,
    seen: [],
    world: {},
    interacted: 0,
    resourcesCollected: 0,
  },
  npcs: JSON.parse(JSON.stringify(INITIAL_NPCS)),
  vehicle: {
    x: 11,
    y: 8,
  },
  log: ['Sistema online. Bem-vindo à Fronteira Neon.'],
  quest: 0,
  playTime: 0,
});

export const QUEST_DEFINITIONS = [
  {
    id: 0,
    title: 'Primeiro contato',
    description: 'Explore 5 novas áreas e converse com alguém na cidade.',
    checkComplete: (state: GameState) => state.player.interacted > 0 && state.player.discoveries >= 5,
  },
  {
    id: 1,
    title: 'Cartógrafo urbano',
    description: 'Continue explorando e registre pelo menos 12 setores no mapa.',
    checkComplete: (state: GameState) => state.player.discoveries >= 12,
  },
  {
    id: 2,
    title: 'Recursos para o futuro',
    description: 'Recolha recursos brilhantes (Q) e reúna pelo menos 3 coletas de materiais.',
    checkComplete: (state: GameState) => state.player.resourcesCollected >= 3,
  },
  {
    id: 3,
    title: 'Arquiteto da Metrópole',
    description: 'Construa pelo menos 3 blocos ou abrigos usando o modo construção (B).',
    checkComplete: (state: GameState) => Object.values(state.player.world).filter(t => t === 'block').length >= 3,
  },
  {
    id: 4,
    title: 'Pioneiro da Fronteira',
    description: 'Fortaleça laços com os 4 habitantes da cidade e continue expandindo a metrópole.',
    checkComplete: (state: GameState) => state.npcs.every(n => n.trust >= 2),
  },
];
