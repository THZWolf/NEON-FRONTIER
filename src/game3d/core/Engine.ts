import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CollisionSystem } from '../world/Collisions';
import { CityDistrict, DistrictVenue } from '../world/CityDistrict';
import { PlayerController } from '../player/PlayerController';
import { NPCManager, NPCInstance } from '../npc/NPCManager';
import { VehicleManager } from '../vehicles/VehicleManager';
import { Vehicle } from '../vehicles/Vehicle';
import { CombatSystem, WeaponData } from '../combat/CombatSystem';
import { CHARACTER_PROFILES, CharacterProfile } from '../player/CharacterProfiles';
import { gameAudio } from './Audio';

export interface EngineDiagnostics {
  fps: number;
  drawCalls: number;
  triangles: number;
  playerPos: { x: number; y: number; z: number };
  npcCount: number;
  stamina: number;
  credits: number;
  health: number;
  armor: number;
  wantedStars: number;
  isDriving: boolean;
  speedKmh: number;
  nitro: number;
  radioStation: string;
  activeWeapon: WeaponData;
  character: CharacterProfile;
  timeOfDay: 'NIGHT' | 'SUNSET' | 'DAY';
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
  public vehicleManager: VehicleManager;
  public combatSystem: CombatSystem;

  // Lighting & Atmosphere
  private hemiLight!: THREE.HemisphereLight;
  private dirLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;
  public timeOfDay: 'NIGHT' | 'SUNSET' | 'DAY' = 'NIGHT';

  // Runtime loop
  private clock = new THREE.Clock();
  private frameId = 0;
  private isRunning = false;
  private isPaused = false;

  // Telemetry
  public diagnostics: EngineDiagnostics;
  private frameCount = 0;
  private lastFpsTime = performance.now();

  // Interaction targets
  public onPromptChange?: (promptText: string | null) => void;
  public onOpenDialogue?: (npc: NPCInstance, text: string) => void;
  public onOpenTerminal?: (terminalName: string) => void;
  public onOpenVenue?: (venue: DistrictVenue) => void;
  public onOpenCharacterSwitch?: () => void;

  public currentInteractableNPC: NPCInstance | null = null;
  public currentInteractableTerminal: { id: string; name: string } | null = null;
  public currentInteractableVenue: DistrictVenue | null = null;
  public currentInteractableVehicle: Vehicle | null = null;
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
    this.scene.fog = new THREE.FogExp2(0x060c18, 0.015);

    // 3. Setup Camera
    const aspect = container.clientWidth / container.clientHeight || 1;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.2, 250);

    // 4. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 5. Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 6. Lighting Setup
    this.setupLighting();

    // 7. Instantiate Subsystems
    this.collisionSystem = new CollisionSystem();
    this.cityDistrict = new CityDistrict(this.collisionSystem);
    this.scene.add(this.cityDistrict.group);

    this.player = new PlayerController(this.camera, this.collisionSystem);
    this.scene.add(this.meshWithPivot(this.player.mesh));

    this.npcManager = new NPCManager(this.scene, this.collisionSystem);
    this.vehicleManager = new VehicleManager(this.scene, this.collisionSystem);
    this.combatSystem = new CombatSystem(this.scene, this.camera);

    // 8. Connect Player Callbacks
    this.setupPlayerCallbacks();

    // Initial diagnostics
    this.diagnostics = {
      fps: 60,
      drawCalls: 0,
      triangles: 0,
      playerPos: { x: 0, y: 0, z: 8 },
      npcCount: 5,
      stamina: 100,
      credits: 45,
      health: this.combatSystem.health,
      armor: this.combatSystem.armor,
      wantedStars: this.combatSystem.wantedStars,
      isDriving: false,
      speedKmh: 0,
      nitro: 100,
      radioStation: 'NEON WAVE 94.7 FM',
      activeWeapon: this.combatSystem.activeWeapon,
      character: this.player.currentCharacter,
      timeOfDay: this.timeOfDay,
    };

    // 9. Event Listeners
    this.setupWindowResize();
    this.setupInteractionKeys();
  }

  private meshWithPivot(m: THREE.Group): THREE.Group {
    return m;
  }

  private setupLighting() {
    this.hemiLight = new THREE.HemisphereLight(0x4070a0, 0x111c2e, 0.7);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0x8cb8ff, 1.2);
    this.dirLight.position.set(30, 50, 25);
    this.dirLight.castShadow = !this.isSoftwareGl;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 130;
    const d = 45;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    this.rimLight = new THREE.DirectionalLight(0xff44aa, 0.5);
    this.rimLight.position.set(-40, 25, -30);
    this.scene.add(this.rimLight);
  }

  public setTimeOfDay(mode: 'NIGHT' | 'SUNSET' | 'DAY') {
    this.timeOfDay = mode;
    if (mode === 'NIGHT') {
      this.scene.background = new THREE.Color(0x060c18);
      this.scene.fog = new THREE.FogExp2(0x060c18, 0.015);
      this.hemiLight.color.setHex(0x4070a0);
      this.hemiLight.groundColor.setHex(0x111c2e);
      this.dirLight.color.setHex(0x8cb8ff);
      this.dirLight.intensity = 1.2;
      this.rimLight.color.setHex(0xff44aa);
    } else if (mode === 'SUNSET') {
      this.scene.background = new THREE.Color(0x28121f);
      this.scene.fog = new THREE.FogExp2(0x28121f, 0.014);
      this.hemiLight.color.setHex(0xff8855);
      this.hemiLight.groundColor.setHex(0x221122);
      this.dirLight.color.setHex(0xffaa44);
      this.dirLight.intensity = 1.6;
      this.rimLight.color.setHex(0x00f2fe);
    } else {
      this.scene.background = new THREE.Color(0x2c4a6e);
      this.scene.fog = new THREE.FogExp2(0x2c4a6e, 0.01);
      this.hemiLight.color.setHex(0xddf0ff);
      this.hemiLight.groundColor.setHex(0x445566);
      this.dirLight.color.setHex(0xfff6dd);
      this.dirLight.intensity = 2.2;
      this.rimLight.color.setHex(0x88bbff);
    }
  }

  private setupPlayerCallbacks() {
    this.player.onShoot = (origin, target) => {
      this.combatSystem.shoot(origin, target);
    };

    this.player.onReload = () => {
      this.combatSystem.reload();
    };

    this.player.onSelectWeapon = (index) => {
      this.combatSystem.selectWeapon(index);
    };

    this.player.onToggleVehicle = () => {
      this.handleToggleVehicle();
    };

    this.player.onCycleCharacter = () => {
      this.onOpenCharacterSwitch?.();
    };
  }

  private handleToggleVehicle() {
    if (this.player.isDriving) {
      // Exit vehicle
      const exitPos = this.vehicleManager.exitVehicle();
      this.player.isDriving = false;
      this.player.drivingVehicle = null;
      this.player.position.copy(exitPos);
      this.player.mesh.position.copy(exitPos);
    } else {
      // Check if near a vehicle to enter
      const vehicle = this.vehicleManager.getClosestVehicle(this.player.position, 3.8);
      if (vehicle) {
        this.vehicleManager.enterVehicle(vehicle);
        this.player.isDriving = true;
        this.player.drivingVehicle = vehicle;
      }
    }
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

  private setupInteractionKeys() {
    window.addEventListener('keydown', (e) => {
      if (this.isPaused) return;
      const k = e.key.toLowerCase();

      // [E] Interact with Venue, NPC, or Terminal
      if (k === 'e' && !this.player.isDriving) {
        if (this.currentInteractableVenue) {
          gameAudio.playInteract();
          this.onOpenVenue?.(this.currentInteractableVenue);
        } else if (this.currentInteractableNPC) {
          this.activeDialogueNPCId = this.currentInteractableNPC.data.id;
          const dialogueText = this.currentInteractableNPC.interact();
          this.onOpenDialogue?.(this.currentInteractableNPC, dialogueText);
        } else if (this.currentInteractableTerminal) {
          gameAudio.playInteract();
          this.player.credits += 15;
          this.onOpenTerminal?.(this.currentInteractableTerminal.name);
        }
      }

      // In-vehicle hotkeys
      if (this.player.isDriving && this.vehicleManager.currentVehicle) {
        const v = this.vehicleManager.currentVehicle;
        if (k === 'l') {
          v.toggleHeadlights();
        }
        if (k === 'r') {
          v.cycleRadioStation();
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
      // 1. Vehicle Driving Physics
      if (this.player.isDriving && this.vehicleManager.currentVehicle) {
        const fwd = (this.player.keys['w'] ? 1 : 0) - (this.player.keys['s'] ? 1 : 0);
        const str = (this.player.keys['d'] ? 1 : 0) - (this.player.keys['a'] ? 1 : 0);
        const brk = !!this.player.keys[' '];
        const ntr = !!this.player.keys['shift'];
        const hrn = !!this.player.keys['h'];

        this.vehicleManager.update(delta, {
          forward: fwd,
          steer: str,
          brake: brk,
          nitro: ntr,
          horn: hrn,
        });
      }

      // 2. Player Controller
      this.player.update(delta);

      // 3. Combat System & Laser Decays
      this.combatSystem.update(delta);

      // 4. Police Cruisers AI Pursuit
      const effectivePos = this.player.isDriving && this.vehicleManager.currentVehicle
        ? this.vehicleManager.currentVehicle.position
        : this.player.position;
      this.vehicleManager.updatePoliceCruisers(delta, effectivePos, this.combatSystem.wantedStars);

      // 5. NPCs
      this.npcManager.update(delta, effectivePos, this.activeDialogueNPCId);

      // 6. City District Animations
      this.cityDistrict.update(delta, elapsed);

      // 7. Proximity Evaluations
      this.checkProximityInteractions(effectivePos);

      // 8. Update Diagnostics
      this.updateDiagnostics();
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private checkProximityInteractions(pos: THREE.Vector3) {
    if (this.player.isDriving) {
      const v = this.vehicleManager.currentVehicle;
      const nitroText = v?.nitro ? `${Math.round(v.nitro)}%` : '100%';
      this.onPromptChange?.(`[F] Sair do Veículo | [Shift] Nitro (${nitroText}) | [L] Faróis | [H] Buzina | [R] Rádio`);
      this.currentInteractableNPC = null;
      this.currentInteractableTerminal = null;
      this.currentInteractableVenue = null;
      this.currentInteractableVehicle = null;
      return;
    }

    // Check closest Vehicle to enter
    const closestVehicle = this.vehicleManager.getClosestVehicle(pos, 3.5);
    this.currentInteractableVehicle = closestVehicle;

    // Check closest Venue
    const closestVenue = this.cityDistrict.getClosestVenue(pos, 4.2);
    this.currentInteractableVenue = closestVenue;

    // Check closest NPC
    const closestNPC = this.npcManager.getClosestInteractable(pos, 2.8);
    this.currentInteractableNPC = closestNPC;

    // Check closest Terminal
    let closestTerm: { id: string; name: string } | null = null;
    let minTermDist = 2.4;
    for (const term of this.cityDistrict.interactiveTerminals) {
      const d = term.position.distanceTo(pos);
      if (d < minTermDist) {
        minTermDist = d;
        closestTerm = { id: term.id, name: term.name };
      }
    }
    this.currentInteractableTerminal = closestTerm;

    // Dispatch prompt
    if (closestVehicle) {
      const label = closestVehicle.type === 'SUPERCAR' ? 'Cyber Supercar' : closestVehicle.type === 'SPORTBIKE' ? 'Sport Bike' : 'Viatura Policial';
      this.onPromptChange?.(`[F] Entrar no Veículo (${label})`);
    } else if (closestVenue) {
      this.onPromptChange?.(closestVenue.prompt);
    } else if (closestNPC) {
      this.onPromptChange?.(`[E] Conversar com ${closestNPC.data.name} (${closestNPC.data.role})`);
    } else if (closestTerm) {
      this.onPromptChange?.(`[E] Acessar ${closestTerm.name} (+15 Créditos)`);
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

    const currentV = this.vehicleManager.currentVehicle;

    this.diagnostics.drawCalls = this.renderer.info.render.calls;
    this.diagnostics.triangles = this.renderer.info.render.triangles;
    this.diagnostics.playerPos = {
      x: Number(this.player.position.x.toFixed(1)),
      y: Number(this.player.position.y.toFixed(1)),
      z: Number(this.player.position.z.toFixed(1)),
    };
    this.diagnostics.stamina = Math.round(this.player.stamina);
    this.diagnostics.credits = this.player.credits;
    this.diagnostics.health = this.combatSystem.health;
    this.diagnostics.armor = this.combatSystem.armor;
    this.diagnostics.wantedStars = this.combatSystem.wantedStars;
    this.diagnostics.isDriving = this.player.isDriving;
    this.diagnostics.speedKmh = currentV ? currentV.speedKmh : 0;
    this.diagnostics.nitro = currentV ? Math.round(currentV.nitro) : 100;
    this.diagnostics.activeWeapon = this.combatSystem.activeWeapon;
    this.diagnostics.character = this.player.currentCharacter;
    this.diagnostics.timeOfDay = this.timeOfDay;
  }

  public dispose() {
    this.isRunning = false;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    this.renderer.dispose();
    this.combatSystem.dispose();
    this.vehicleManager.dispose();

    if (this.container && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
