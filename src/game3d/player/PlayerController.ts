import * as THREE from 'three';
import { CollisionSystem } from '../world/Collisions';
import { gameAudio } from '../core/Audio';

export class PlayerController {
  public mesh: THREE.Group;
  public camera: THREE.PerspectiveCamera;
  public position = new THREE.Vector3(0, 0, 8); // Start in central plaza
  public velocity = new THREE.Vector3(0, 0, 0);

  // States
  public isGrounded = true;
  public isRunning = false;
  public isMoving = false;
  public stamina = 100;
  public credits = 45;

  // Camera Orbit parameters
  public cameraYaw = 0;
  public cameraPitch = 0.25; // radians
  public cameraDistance = 5.5;
  private readonly minPitch = -0.4;
  private readonly maxPitch = 1.1;

  // Kinematics & Body Parts for Procedural Animation
  private headMesh!: THREE.Mesh;
  private torsoMesh!: THREE.Mesh;
  private leftArmGroup!: THREE.Group;
  private rightArmGroup!: THREE.Group;
  private leftLegGroup!: THREE.Group;
  private rightLegGroup!: THREE.Group;
  private walkCycleTime = 0;
  private stepTimer = 0;

  // Input states
  private keys: Record<string, boolean> = {};
  public isPointerLocked = false;

  constructor(
    camera: THREE.PerspectiveCamera,
    private collisionSystem: CollisionSystem
  ) {
    this.camera = camera;
    this.mesh = this.buildCharacterMesh();
    this.setupInputListeners();
  }

  // Build 8+ part articulated cyber-operative character
  private buildCharacterMesh(): THREE.Group {
    const char = new THREE.Group();

    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x142032,
      roughness: 0.4,
      metalness: 0.6,
    });
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x223652,
      roughness: 0.2,
      metalness: 0.8,
    });
    const visorMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
    });

    // 1. Torso
    this.torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.8, 0.4), suitMat);
    this.torsoMesh.position.y = 1.25;
    this.torsoMesh.castShadow = true;
    char.add(this.torsoMesh);

    // Chest armor plate
    const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.12), armorMat);
    chestPlate.position.set(0, 0.1, 0.2);
    this.torsoMesh.add(chestPlate);

    // 2. Head & Visor
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.85, 0);

    this.headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.38), armorMat);
    this.headMesh.castShadow = true;
    headGroup.add(this.headMesh);

    // Glowing cyan cyber visor
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.1), visorMat);
    visor.position.set(0, 0.05, 0.19);
    headGroup.add(visor);
    char.add(headGroup);

    // 3. Left Arm Group (pivot at shoulder)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.48, 1.55, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.22), suitMat);
    leftArmMesh.position.y = -0.32;
    leftArmMesh.castShadow = true;
    this.leftArmGroup.add(leftArmMesh);
    char.add(this.leftArmGroup);

    // 4. Right Arm Group (pivot at shoulder)
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.48, 1.55, 0);
    const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.22), suitMat);
    rightArmMesh.position.y = -0.32;
    rightArmMesh.castShadow = true;
    this.rightArmGroup.add(rightArmMesh);
    char.add(this.rightArmGroup);

    // 5. Left Leg Group (pivot at hip)
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.2, 0.85, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.85, 0.26), armorMat);
    leftLegMesh.position.y = -0.42;
    leftLegMesh.castShadow = true;
    this.leftLegGroup.add(leftLegMesh);
    char.add(this.leftLegGroup);

    // 6. Right Leg Group (pivot at hip)
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.2, 0.85, 0);
    const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.85, 0.26), armorMat);
    rightLegMesh.position.y = -0.42;
    rightLegMesh.castShadow = true;
    this.rightLegGroup.add(rightLegMesh);
    char.add(this.rightLegGroup);

    char.position.copy(this.position);
    return char;
  }

  private isMouseDown = false;
  private prevMouseX = 0;
  private prevMouseY = 0;

  // Setup Keyboard & Mouse Listeners
  private setupInputListeners() {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      this.keys[k] = true;

      if (k === ' ' && this.isGrounded) {
        this.velocity.y = 8.5; // Jump impulse
        this.isGrounded = false;
        gameAudio.playJump();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = !!document.pointerLockElement;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.isMouseDown = true;
        this.prevMouseX = e.clientX;
        this.prevMouseY = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    window.addEventListener('mousemove', (e) => {
      const sensitivity = 0.0024;
      if (this.isPointerLocked) {
        this.cameraYaw -= e.movementX * sensitivity;
        this.cameraPitch = Math.max(
          this.minPitch,
          Math.min(this.maxPitch, this.cameraPitch - e.movementY * sensitivity)
        );
      } else if (this.isMouseDown && (e.buttons === 1 || e.buttons === 2)) {
        // Drag-to-look fallback
        const dx = e.clientX - this.prevMouseX;
        const dy = e.clientY - this.prevMouseY;
        this.prevMouseX = e.clientX;
        this.prevMouseY = e.clientY;
        this.cameraYaw -= dx * sensitivity;
        this.cameraPitch = Math.max(
          this.minPitch,
          Math.min(this.maxPitch, this.cameraPitch - dy * sensitivity)
        );
      }
    });
  }

  // Request pointer lock for immersive camera look
  public requestPointerLock(element: HTMLElement) {
    element.requestPointerLock?.();
  }

  // Teleport player back to a safe point (e.g. Nexus Plaza)
  public resetPosition(x = 0, y = 0, z = 8) {
    this.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.mesh.position.copy(this.position);
    this.cameraYaw = 0;
    this.cameraPitch = 0.25;
  }

  // Virtual directional input for mobile touch controls
  public setVirtualInput(forward: number, strafe: number, sprint: boolean) {
    this.keys['w'] = forward > 0.3;
    this.keys['s'] = forward < -0.3;
    this.keys['d'] = strafe > 0.3;
    this.keys['a'] = strafe < -0.3;
    this.keys['shift'] = sprint;
  }

  public virtualJump() {
    if (this.isGrounded) {
      this.velocity.y = 8.5;
      this.isGrounded = false;
      gameAudio.playJump();
    }
  }

  // Update loop called every frame
  public update(delta: number) {
    const dt = Math.min(delta, 0.05);

    // 1. Determine Movement Direction from input relative to camera yaw
    const forward = (this.keys['w'] ? 1 : 0) - (this.keys['s'] ? 1 : 0);
    const strafe = (this.keys['d'] ? 1 : 0) - (this.keys['a'] ? 1 : 0);
    const wantRun = !!this.keys['shift'] && this.stamina > 5;

    const inputMag = Math.hypot(forward, strafe);
    this.isMoving = inputMag > 0.05;

    // Stamina depletion / regeneration
    if (this.isMoving && wantRun) {
      this.isRunning = true;
      this.stamina = Math.max(0, this.stamina - dt * 18);
    } else {
      this.isRunning = false;
      this.stamina = Math.min(100, this.stamina + dt * 14);
    }

    const moveSpeed = this.isRunning ? 9.5 : 5.5;

    if (this.isMoving) {
      // Calculate angle relative to camera yaw
      const inputAngle = Math.atan2(strafe, forward);
      const targetAngle = this.cameraYaw + inputAngle;

      const moveX = Math.sin(targetAngle) * moveSpeed;
      const moveZ = Math.cos(targetAngle) * moveSpeed;

      // Accelerate horizontally
      this.velocity.x = THREE.MathUtils.damp(this.velocity.x, moveX, 14, dt);
      this.velocity.z = THREE.MathUtils.damp(this.velocity.z, moveZ, 14, dt);

      // Smoothly rotate character toward movement heading
      const currentRot = this.mesh.rotation.y;
      const angleDiff = Math.atan2(Math.sin(targetAngle - currentRot), Math.cos(targetAngle - currentRot));
      this.mesh.rotation.y += angleDiff * Math.min(1, dt * 12);
    } else {
      this.velocity.x = THREE.MathUtils.damp(this.velocity.x, 0, 16, dt);
      this.velocity.z = THREE.MathUtils.damp(this.velocity.z, 0, 16, dt);
    }

    // 2. Gravity & Vertical Physics
    if (!this.isGrounded) {
      this.velocity.y -= 22.0 * dt; // gravity
    }

    // 3. Collision Resolution
    const candidatePos = this.position.clone();
    candidatePos.x += this.velocity.x * dt;
    candidatePos.z += this.velocity.z * dt;
    candidatePos.y += this.velocity.y * dt;

    // Sliding collision on X and Z
    const resolvedPos = this.collisionSystem.resolveMovement(this.position, candidatePos, 0.45);
    this.position.x = resolvedPos.x;
    this.position.z = resolvedPos.z;

    // Ground check (flat ground at y = 0.0)
    if (candidatePos.y <= 0) {
      if (!this.isGrounded && this.velocity.y < -3) {
        gameAudio.playLand();
      }
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.position.y = candidatePos.y;
      if (this.position.y > 0.05) {
        this.isGrounded = false;
      }
    }

    this.mesh.position.copy(this.position);

    // 4. Procedural Character Locomotion Animation
    if (this.isMoving && this.isGrounded) {
      const cycleSpeed = this.isRunning ? 16 : 10;
      this.walkCycleTime += dt * cycleSpeed;

      const legAngle = Math.sin(this.walkCycleTime) * (this.isRunning ? 0.75 : 0.5);
      this.leftLegGroup.rotation.x = legAngle;
      this.rightLegGroup.rotation.x = -legAngle;

      this.leftArmGroup.rotation.x = -legAngle * 0.8;
      this.rightArmGroup.rotation.x = legAngle * 0.8;

      // Slight vertical bob
      this.torsoMesh.position.y = 1.25 + Math.abs(Math.sin(this.walkCycleTime * 2)) * 0.06;

      // Audio footstep trigger
      this.stepTimer += dt * cycleSpeed;
      if (this.stepTimer >= Math.PI) {
        gameAudio.playFootstep(this.isRunning);
        this.stepTimer = 0;
      }
    } else if (!this.isGrounded) {
      // In-air jump pose
      this.leftLegGroup.rotation.x = -0.3;
      this.rightLegGroup.rotation.x = 0.4;
      this.leftArmGroup.rotation.x = -0.6;
      this.rightArmGroup.rotation.x = -0.6;
      this.torsoMesh.position.y = 1.25;
    } else {
      // Idle breathing pose
      this.walkCycleTime += dt * 2.0;
      this.leftLegGroup.rotation.x = THREE.MathUtils.damp(this.leftLegGroup.rotation.x, 0, 10, dt);
      this.rightLegGroup.rotation.x = THREE.MathUtils.damp(this.rightLegGroup.rotation.x, 0, 10, dt);
      this.leftArmGroup.rotation.x = THREE.MathUtils.damp(this.leftArmGroup.rotation.x, 0, 10, dt);
      this.rightArmGroup.rotation.x = THREE.MathUtils.damp(this.rightArmGroup.rotation.x, 0, 10, dt);
      this.torsoMesh.position.y = 1.25 + Math.sin(this.walkCycleTime) * 0.02;
    }

    // 5. Camera Follow with Smooth Spherical Coordinates
    const targetLookAt = this.position.clone().add(new THREE.Vector3(0, 1.7, 0));

    // Spherical offset from player based on yaw & pitch
    const camOffsetX = Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;
    const camOffsetY = Math.sin(this.cameraPitch) * this.cameraDistance;
    const camOffsetZ = Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;

    const desiredCamPos = targetLookAt.clone().add(new THREE.Vector3(camOffsetX, camOffsetY, camOffsetZ));

    // Check camera collision with buildings so camera doesn't clip inside walls
    if (desiredCamPos.y < 0.6) desiredCamPos.y = 0.6;

    this.camera.position.lerp(desiredCamPos, Math.min(1, dt * 14));
    this.camera.lookAt(targetLookAt);
  }
}
