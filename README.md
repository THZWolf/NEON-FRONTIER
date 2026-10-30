# NEON FRONTIER — React Edition

Jogo de exploração urbana 2D em metrópole neon, reescrito em **React 19**, **TypeScript** e **Vite** com Tailwind CSS, preservando toda a jogabilidade original, geração procedural determinística de mapa e mecânicas da Build 1.0.

## Recursos Principais

- **Exploração Urbana (100 x 80)**: Mapa procedural determinístico com avenidas, vias expressas, edifícios neon, árvores sintéticas, água e divisões de setores.
- **Veículo Hover**: Entre ou saia do veículo (F) para cruzar a cidade com velocidade duplicada.
- **Sistema de Coleta**: Colete cristais fluorescentes e sucata urbana (Q) para acumular créditos e materiais.
- **Modo Construção**: Ative com (B) para erguer estruturas sólidas gastando materiais ou desmontar blocos para reciclagem em um raio de até 4 blocos.
- **Cidadãos com Memória e Afeto**: Interaja com Mira, Sol, Kai e Nix (E) para conversar, aumentar o nível de confiança (♥), desbloquear diálogos e registrar memórias.
- **Sistema de Quests & Objetivos**: Linha progressiva de marcos com recompensas de créditos e desbloqueios.
- **Persistência Local (LocalStorage)**: Salvamento automático a cada ação e salvamento manual.
- **Áudio Sintetizado Web Audio API**: Efeitos sonoros cyberpunk retro procedurais (passos, motor de hover, coleta brilhante, construção e fanfarra).
- **Controles Responsivos e Gamepad**: Compatível com teclado (WASD / setas), controles táteis / D-pad virtual para mobile e Gamepad API nativa.

## Controles

| Tecla | Ação |
| :--- | :--- |
| **W A S D** ou **Setas** | Mover explorador / pilotar veículo |
| **E** | Conversar / interagir com habitantes próximos |
| **B** | Alternar modo construção (clique num terreno próximo) |
| **F** | Embarcar / desembarcar do veículo |
| **Q** | Coletar cristais e sucata / radar de recursos |
| **Esc** | Pausar / abrir menu |

## Desenvolvimento Local

```bash
npm install
npm run dev
```

O servidor iniciará em `http://0.0.0.0:3000`.
