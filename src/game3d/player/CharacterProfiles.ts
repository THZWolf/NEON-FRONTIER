export interface CharacterProfile {
  id: string;
  name: string;
  codename: string;
  role: string;
  perk: string;
  bio: string;
  themeColor: string;
  portraitIcon: string;
  stats: {
    combat: number;
    driving: number;
    stealth: number;
    hacking: number;
  };
}

export const CHARACTER_PROFILES: CharacterProfile[] = [
  {
    id: 'alex',
    name: 'Alex Mercer',
    codename: 'TITAN',
    role: 'Soldado Cibernético / Tático',
    perk: '+35% Resistência a Balas & Recuo Reduzido',
    bio: 'Ex-agente das Forças Especiais de Neon Frontier. Equipado com braço cibernético tático e blindagem militar.',
    themeColor: '#00f2fe',
    portraitIcon: 'shield',
    stats: {
      combat: 95,
      driving: 70,
      stealth: 60,
      hacking: 55,
    },
  },
  {
    id: 'maya',
    name: 'Maya Lin',
    codename: 'PHANTOM',
    role: 'Infiltradora & Netrunner',
    perk: 'Passos Silenciosos & +50% Créditos por Hack de Terminais',
    bio: 'Lendária hacker underground do porto de Neon Frontier. Especialista em quebra de criptografia corporativa.',
    themeColor: '#ff0077',
    portraitIcon: 'terminal',
    stats: {
      combat: 65,
      driving: 75,
      stealth: 95,
      hacking: 98,
    },
  },
  {
    id: 'victor',
    name: 'Victor Cruz',
    codename: 'VELOX',
    role: 'Piloto de Fuga & Mecânico Chefe',
    perk: '+25% Velocidade de Veículos & Recarga Rápida de Nitro',
    bio: 'Rei das corridas clandestinas no viaduto da cidade e chefe de engenharia da oficina AUTO-MOD 31.',
    themeColor: '#ffaa00',
    portraitIcon: 'gauge',
    stats: {
      combat: 70,
      driving: 98,
      stealth: 65,
      hacking: 70,
    },
  },
];
