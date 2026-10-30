import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CollisionSystem } from '../world/Collisions';
import { CityDistrict } from '../world/CityDistrict';
import { PlayerController } from '../player/PlayerController';
import { NPCManager, NPCInstance } from '../npc/NPCManager';
import { gameAudio } from './Audio';

export interface EngineDiagnostics {
  fps: number;
  drawCalls: number;
  triangles: number;
  playerPos: { x: number; y: number; z: number };
  npcCount: number;
  stamina: number;
  credits: number;
}

export class GameEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public isSoftwareGl: boolean;

  // Subsystems
  public collisionSystem: CollisionSystem;
  public cityDistrict: CityDistrict;
  public player: PlayerController;
  public npcManager: NPCManager;

  // Runtime loop
  private clock = new THREE.Clock();
  private frameId = 0;
  private isRunning = false;
  private isPaused = false;

  // Telemetry & Diagnostic stats
  public diagnostics: EngineDiagnostics = {
    fps: 60,
    drawCalls: 0,
    triangles: 0,
    playerPos: { x: 0, y: 0, z: 0 },
    npcCount: 5,
    stamina: 100,
    credits: 45,
  };
  private frameCount = 0;
  private lastFpsTime = performance.now();

  // Interaction target callbacks
  public onPromptChange?: (promptText: string | null) => void;
  public onOpenDialogue?: (npc: NPCInstance, text: string) => void;
  public onOpenTerminal?: (terminalName: string) => void;
  public currentInteractableNPC: NPCInstance | null = null;
  public currentInteractableTerminal: { id: string; name: string } | null = null;
  public activeDialogueNPCId: string | null = null;

  constructor(private container: HTMLElement) {
    // 1. Detect software WebGL safely
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Setup Scene & Atmospheric Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060c18);
    this.scene.fog = new THREE.FogExp2(0x060c18, 0.016);

    // 3. Setup Camera
    const aspect = container.clientWidth / container.clientHeight || 1;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.2, 200);

    // 4. Setup Renderer with PBR Pipeline
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 5. Procedural RoomEnvironment reflection map
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 6. Balanced 3-Point Studio Lighting
    this.setupLighting();

    // 7. Instantiate Subsystems
    this.collisionSystem = new CollisionSystem();
    this.cityDistrict = new CityDistrict(this.collisionSystem);
    this.scene.add(this.cityDistrict.group);

    this.player = new PlayerController(this.camera, this.collisionSystem);
    this.scene.add(this.player.mesh);

    this.npcManager = new NPCManager(this.scene, this.collisionSystem);

    // 8. Event listeners
    this.setupWindowResize();
    this.setupInteractionKey();
  }

  // Balanced Cyberpunk Lighting Setup
  private setupLighting() {
    // Cool sky/ground ambient fill
    const hemiLight = new THREE.HemisphereLight(0x4070a0, 0x111c2e, 0.7);
    this.scene.add(hemiLight);

    // Moonlight Key Directional Light
    const dirLight = new THREE.DirectionalLight(0x8cb8ff, 1.2);
    dirLight.position.set(30, 50, 25);
    dirLight.castShadow = !this.isSoftwareGl;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 120;
    const d = 45;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.normalBias = 0.02;
    this.scene.add(dirLight);

    // Warm Magenta / Cyan City Horizon Rim Light
    const rimLight = new THREE.DirectionalLight(0xff44aa, 0.5);
    rimLight.position.set(-40, 25, -30);
    this.scene.add(rimLight);
  }

  private setupWindowResize() {
    const handleResize = () => {
      if (!this.container) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
  }

  private setupInteractionKey() {
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'e' && !this.isPaused) {
        if (this.currentInteractableNPC) {
          this.activeDialogueNPCId = this.currentInteractableNPC.data.id;
          const dialogueText = this.currentInteractableNPC.interact();
          this.onOpenDialogue?.(this.currentInteractableNPC, dialogueText);
        } else if (this.currentInteractableTerminal) {
          gameAudio.playInteract();
          this.player.credits += 15;
          this.onOpenTerminal?.(this.currentInteractableTerminal.name);
        }
      }
    });
  }

  // Start the main game loop
  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.clock.start();
    this.tick();
  }

  public pause(paused: boolean) {
    this.isPaused = paused;
    if (!paused) {
      this.clock.start();
    }
  }

  public setDialogueActive(npcId: string | null) {
    this.activeDialogueNPCId = npcId;
  }

  // Paced loop compliant with Three.js Software-WebGL directives
  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 70);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private tick = () => {
    if (!this.isRunning) return;

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    if (!this.isPaused) {
      // 1. Update Player Controller
      this.player.update(delta);

      // 2. Update NPCs
      this.npcManager.update(delta, this.player.position, this.activeDialogueNPCId);

      // 3. Update Animated City District (rotating obelisk, flickering neon)
      this.cityDistrict.update(delta, elapsed);

      // 4. Proximity & Interaction Prompt Evaluation
      this.checkProximityInteractions();

      // 5. Update Diagnostics telemetry
      this.updateDiagnostics();
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);

    // Schedule next frame
    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private checkProximityInteractions() {
    // Check closest NPC
    const closestNPC = this.npcManager.getClosestInteractable(this.player.position, 2.8);
    this.currentInteractableNPC = closestNPC;

    // Check closest Terminal
    let closestTerm: { id: string; name: string } | null = null;
    let minTermDist = 2.4;
    for (const term of this.cityDistrict.interactiveTerminals) {
      const d = term.position.distanceTo(this.player.position);
      if (d < minTermDist) {
        minTermDist = d;
        closestTerm = { id: term.id, name: term.name };
      }
    }
    this.currentInteractableTerminal = closestTerm;

    // Dispatch prompt text to React HUD
    if (this.currentInteractableNPC) {
      this.onPromptChange?.(`[E] Conversar com ${this.currentInteractableNPC.data.name} (${this.currentInteractableNPC.data.role})`);
    } else if (this.currentInteractableTerminal) {
      this.onPromptChange?.(`[E] Acessar ${this.currentInteractableTerminal.name} (+15 Créditos)`);
    } else {
      this.onPromptChange?.(null);
    }
  }

  private updateDiagnostics() {
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsTime >= 500) {
      this.diagnostics.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
      this.frameCount = 0;
      this.lastFpsTime = now;
    }

    this.diagnostics.drawCalls = this.renderer.info.render.calls;
    this.diagnostics.triangles = this.renderer.info.render.triangles;
    this.diagnostics.playerPos = {
      x: Number(this.player.position.x.toFixed(1)),
      y: Number(this.player.position.y.toFixed(1)),
      z: Number(this.player.position.z.toFixed(1)),
    };
    this.diagnostics.stamina = Math.round(this.player.stamina);
    this.diagnostics.credits = this.player.credits;
  }

  // Cleanup on unmount
  public dispose() {
    this.isRunning = false;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
