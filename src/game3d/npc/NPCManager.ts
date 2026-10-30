import * as THREE from 'three';
import { CollisionSystem } from '../world/Collisions';
import { npcMemoryStore } from './NPCMemory';
import { gameAudio } from '../core/Audio';

export type NPCBehaviorState = 'Idle' | 'Wander' | 'Observe' | 'Approach' | 'Flee' | 'Interact';

export interface NPCData {
  id: string;
  name: string;
  role: string;
  colorHex: number;
  homePosition: THREE.Vector3;
  waypoints: THREE.Vector3[];
  dialogues: string[];
}

export class NPCInstance {
  public mesh: THREE.Group;
  public state: NPCBehaviorState = 'Idle';
  public position: THREE.Vector3;
  public velocity = new THREE.Vector3();
  public targetPos: THREE.Vector3;
  public currentWaypointIdx = 0;
  public stateTimer = 0;
  public perceptionRadius = 7.5;
  public trustLevel = 0;

  // Body parts for procedural articulation
  private headMesh!: THREE.Mesh;
  private leftLeg!: THREE.Group;
  private rightLeg!: THREE.Group;
  private walkTime = 0;

  constructor(
    public data: NPCData,
    private collisionSystem: CollisionSystem
  ) {
    this.position = data.homePosition.clone();
    this.targetPos = data.homePosition.clone();
    this.mesh = this.buildMesh();
    this.mesh.position.copy(this.position);

    // Initial trust from saved memories
    const previousConversations = npcMemoryStore.countInteractions(data.id);
    this.trustLevel = Math.min(5, previousConversations);
  }

  // Build unique 3D articulated model per NPC
  private buildMesh(): THREE.Group {
    const group = new THREE.Group();

    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x152233,
      roughness: 0.5,
      metalness: 0.5,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: this.data.colorHex,
      roughness: 0.2,
      metalness: 0.8,
    });
    const glowMat = new THREE.MeshBasicMaterial({
      color: this.data.colorHex,
    });

    if (this.data.id === 'npc_echo') {
      // Echo is a floating hovering Sentinel Droid
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), accentMat);
      body.position.y = 1.6;
      group.add(body);

      // Glowing scanner eye
      this.headMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.2, 16), glowMat);
      this.headMesh.rotation.x = Math.PI / 2;
      this.headMesh.position.set(0, 1.6, 0.45);
      group.add(this.headMesh);

      // Hover thruster light
      const thrusterLight = new THREE.PointLight(this.data.colorHex, 1.5, 5);
      thrusterLight.position.set(0, 1.1, 0);
      group.add(thrusterLight);
    } else {
      // Humanoid NPC
      // 1. Torso
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.75, 0.35), suitMat);
      torso.position.y = 1.25;
      torso.castShadow = true;
      group.add(torso);

      // Chest badge with signature neon color
      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.08), accentMat);
      badge.position.set(0, 0.15, 0.18);
      torso.add(badge);

      // 2. Head & Visor
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.85, 0);
      this.headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.34), suitMat);
      headGroup.add(this.headMesh);

      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.08), glowMat);
      visor.position.set(0, 0.05, 0.17);
      headGroup.add(visor);
      group.add(headGroup);

      // 3. Legs
      this.leftLeg = new THREE.Group();
      this.leftLeg.position.set(-0.18, 0.85, 0);
      const lMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.8, 0.24), suitMat);
      lMesh.position.y = -0.4;
      this.leftLeg.add(lMesh);
      group.add(this.leftLeg);

      this.rightLeg = new THREE.Group();
      this.rightLeg.position.set(0.18, 0.85, 0);
      const rMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.8, 0.24), suitMat);
      rMesh.position.y = -0.4;
      this.rightLeg.add(rMesh);
      group.add(this.rightLeg);
    }

    // Overhead Floating Canvas Name Tag
    const tagCanvas = document.createElement('canvas');
    tagCanvas.width = 256;
    tagCanvas.height = 64;
    const tctx = tagCanvas.getContext('2d')!;
    tctx.fillStyle = '#081220cc';
    tctx.fillRect(0, 0, 256, 64);
    tctx.strokeStyle = '#00f2fe';
    tctx.lineWidth = 3;
    tctx.strokeRect(3, 3, 250, 58);
    tctx.fillStyle = '#ffffff';
    tctx.font = 'bold 22px sans-serif';
    tctx.textAlign = 'center';
    tctx.fillText(this.data.name, 128, 28);
    tctx.fillStyle = '#8faecf';
    tctx.font = '14px monospace';
    tctx.fillText(this.data.role, 128, 50);

    const tagTex = new THREE.CanvasTexture(tagCanvas);
    const tagMat = new THREE.SpriteMaterial({ map: tagTex });
    const sprite = new THREE.Sprite(tagMat);
    sprite.position.y = 2.45;
    sprite.scale.set(1.8, 0.45, 1);
    group.add(sprite);

    return group;
  }

  // Update FSM behavior and kinematics
  public update(delta: number, playerPos: THREE.Vector3, isPlayerInteractingWithMe: boolean) {
    this.stateTimer -= delta;

    const distToPlayer = this.position.distanceTo(playerPos);

    // FSM State Selection
    if (isPlayerInteractingWithMe) {
      this.state = 'Interact';
    } else if (distToPlayer < 2.5) {
      this.state = 'Observe';
    } else if (distToPlayer < this.perceptionRadius && this.data.id === 'npc_jax') {
      this.state = 'Approach'; // Jax proactively approaches prospective clients
    } else {
      if (this.stateTimer <= 0) {
        // Toggle between Idle and Wander
        this.state = Math.random() > 0.45 ? 'Wander' : 'Idle';
        this.stateTimer = 4.0 + Math.random() * 5.0;

        if (this.state === 'Wander' && this.data.waypoints.length > 0) {
          this.currentWaypointIdx = (this.currentWaypointIdx + 1) % this.data.waypoints.length;
          this.targetPos = this.data.waypoints[this.currentWaypointIdx].clone();
        }
      }
    }

    // Execute state motion
    let moveTarget: THREE.Vector3 | null = null;
    let speed = 2.4;

    switch (this.state) {
      case 'Interact':
      case 'Observe':
        // Face player smoothly
        const lookDir = playerPos.clone().sub(this.position);
        lookDir.y = 0;
        if (lookDir.lengthSq() > 0.01) {
          const targetAngle = Math.atan2(lookDir.x, lookDir.z);
          this.mesh.rotation.y = THREE.MathUtils.damp(this.mesh.rotation.y, targetAngle, 8, delta);
        }
        break;

      case 'Approach':
        moveTarget = playerPos.clone().add(playerPos.clone().sub(this.position).normalize().multiplyScalar(-1.8));
        moveTarget.y = 0;
        speed = 2.0;
        break;

      case 'Wander':
        moveTarget = this.targetPos;
        speed = 1.8;
        break;

      case 'Idle':
      default:
        break;
    }

    // Move toward target if applicable
    if (moveTarget) {
      const dir = moveTarget.clone().sub(this.position);
      dir.y = 0;
      const dist = dir.length();

      if (dist > 0.6) {
        dir.normalize();
        this.velocity.x = dir.x * speed;
        this.velocity.z = dir.z * speed;

        const targetRot = Math.atan2(dir.x, dir.z);
        this.mesh.rotation.y = THREE.MathUtils.damp(this.mesh.rotation.y, targetRot, 8, delta);

        const newPos = this.position.clone();
        newPos.x += this.velocity.x * delta;
        newPos.z += this.velocity.z * delta;

        // Collision check
        const resolved = this.collisionSystem.resolveMovement(this.position, newPos, 0.4);
        this.position.copy(resolved);
        this.mesh.position.copy(this.position);

        // Locomotion walk swing
        this.walkTime += delta * 7.0;
        if (this.leftLeg && this.rightLeg) {
          this.leftLeg.rotation.x = Math.sin(this.walkTime) * 0.4;
          this.rightLeg.rotation.x = -Math.sin(this.walkTime) * 0.4;
        }
      } else {
        this.velocity.set(0, 0, 0);
      }
    } else {
      this.velocity.set(0, 0, 0);
      if (this.leftLeg && this.rightLeg) {
        this.leftLeg.rotation.x = THREE.MathUtils.damp(this.leftLeg.rotation.x, 0, 8, delta);
        this.rightLeg.rotation.x = THREE.MathUtils.damp(this.rightLeg.rotation.x, 0, 8, delta);
      }
    }

    // Floating droid hover animation for Echo
    if (this.data.id === 'npc_echo') {
      this.mesh.position.y = Math.sin(performance.now() * 0.003) * 0.15;
    }
  }

  // Trigger dialogue conversation
  public interact(): string {
    this.trustLevel = Math.min(5, this.trustLevel + 1);
    const dialogueIdx = (this.trustLevel - 1) % this.data.dialogues.length;
    const response = this.data.dialogues[dialogueIdx];

    // Record episodic memory
    npcMemoryStore.recordEvent(
      this.data.id,
      'CONVERSATION',
      `Conversa com o jogador. Nível de confiança: ${this.trustLevel}/5. Resposta: "${response.substring(0, 35)}..."`,
      0.7
    );

    gameAudio.playTalkBlip(this.data.id === 'npc_echo' ? 620 : 380);
    return response;
  }
}

export class NPCManager {
  public npcs: NPCInstance[] = [];

  constructor(
    private scene: THREE.Scene,
    private collisionSystem: CollisionSystem
  ) {
    this.spawnNPCs();
  }

  private spawnNPCs() {
    const definitions: NPCData[] = [
      {
        id: 'npc_nix',
        name: 'Nix',
        role: 'Sintetizadora de Artefatos',
        colorHex: 0x00f2fe,
        homePosition: new THREE.Vector3(-4, 0, 4),
        waypoints: [
          new THREE.Vector3(-4, 0, 4),
          new THREE.Vector3(-8, 0, 2),
          new THREE.Vector3(-4, 0, -5),
          new THREE.Vector3(2, 0, 5),
        ],
        dialogues: [
          '“A ressonância do obelisco central tem aumentado desde o último ciclo.”',
          '“Se encontrar cristais neon nas vias, posso convertê-los em créditos.”',
          '“Sua presença aqui me inspira a continuar refinando a rede do distrito.”',
          '“Pioneiro, a metrópole inteira está começando a notar suas jornadas!”',
        ],
      },
      {
        id: 'npc_viper',
        name: 'Viper',
        role: 'Ex-Mercenário / Tático',
        colorHex: 0xff3355,
        homePosition: new THREE.Vector3(0, 0, -18),
        waypoints: [
          new THREE.Vector3(0, 0, -18),
          new THREE.Vector3(-14, 0, -18),
          new THREE.Vector3(14, 0, -18),
        ],
        dialogues: [
          '“Mantenha sua guarda alta. As sombras entre os edifícios não são vazias.”',
          '“Vi você correndo pela avenida. Passadas firmes, boa postura tática.”',
          '“Se houver qualquer emboscada, use as quinas de concreto como abrigo.”',
          '“Você provou ser confiável. Tem o respeito de um veterano.”',
        ],
      },
      {
        id: 'npc_cipher',
        name: 'Cipher',
        role: 'Hacker & Informante',
        colorHex: 0xff5fa2,
        homePosition: new THREE.Vector3(22, 0, -6),
        waypoints: [
          new THREE.Vector3(22, 0, -6),
          new THREE.Vector3(26, 0, 4),
          new THREE.Vector3(20, 0, -12),
        ],
        dialogues: [
          '“Os terminais de dados desta rua ainda transmitem pacotes cifrados.”',
          '“Se acessar o terminal leste, vai captar ecos da antiga frequência central.”',
          '“Gosto de quem sabe observar sem fazer barulho. Temos muito a trocar.”',
          '“Seus dados de exploração foram arquivados com chave de segurança quântica.”',
        ],
      },
      {
        id: 'npc_jax',
        name: 'Jax',
        role: 'Fixer / Contrabandista',
        colorHex: 0xffd166,
        homePosition: new THREE.Vector3(-20, 0, 8),
        waypoints: [
          new THREE.Vector3(-20, 0, 8),
          new THREE.Vector3(-24, 0, -4),
          new THREE.Vector3(-16, 0, 14),
        ],
        dialogues: [
          '“Tempo é crédito na Fronteira Neon. O que você procura hoje?”',
          '“Tenho rotas comerciais que evitam qualquer barreira perimetral.”',
          '“Você não parece um burocrata corporativo. Podemos fazer bons negócios.”',
          '“Parceria fechada! Minhas portas no mercado cinza estão abertas para você.”',
        ],
      },
      {
        id: 'npc_echo',
        name: 'Echo',
        role: 'Droide Sentinela',
        colorHex: 0x67c23a,
        homePosition: new THREE.Vector3(0, 0, 16),
        waypoints: [
          new THREE.Vector3(0, 0, 16),
          new THREE.Vector3(16, 0, 16),
          new THREE.Vector3(-16, 0, 16),
        ],
        dialogues: [
          '“SCAN PROTOCOL 04: Cidadão identificado. Sem mandados ativos no quadrante.”',
          '“Lembrete de segurança: permaneça dentro dos perímetros autorizados.”',
          '“Registro de tráfego atualizado: explorador ativo nas coordenadas centrais.”',
          '“STATUS: Nível de confiança do cidadão elevado ao patamar de aliado.”',
        ],
      },
    ];

    definitions.forEach((def) => {
      const npc = new NPCInstance(def, this.collisionSystem);
      this.npcs.push(npc);
      this.scene.add(npc.mesh);
    });
  }

  // Update all NPCs
  public update(delta: number, playerPos: THREE.Vector3, interactingNpcId: string | null) {
    this.npcs.forEach((npc) => {
      npc.update(delta, playerPos, interactingNpcId === npc.data.id);
    });
  }

  // Find closest NPC to player within interaction distance
  public getClosestInteractable(playerPos: THREE.Vector3, maxDist = 2.8): NPCInstance | null {
    let closest: NPCInstance | null = null;
    let minDist = maxDist;

    this.npcs.forEach((npc) => {
      const d = npc.position.distanceTo(playerPos);
      if (d < minDist) {
        minDist = d;
        closest = npc;
      }
    });

    return closest;
  }
}
