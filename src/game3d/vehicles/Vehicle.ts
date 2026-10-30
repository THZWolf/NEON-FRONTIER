import * as THREE from 'three';
import { CollisionSystem } from '../world/Collisions';
import { gameAudio } from '../core/Audio';

export type VehicleType = 'SUPERCAR' | 'SPORTBIKE' | 'POLICE_CRUISER';

export interface VehicleCustomization {
  paintColor: number;
  underglowColor: number;
  neonUnderglowEnabled: boolean;
  turboLevel: number; // 1-3
  nitroMax: number;
}

export class Vehicle {
  public mesh = new THREE.Group();
  public position = new THREE.Vector3();
  public velocity = new THREE.Vector3();
  public rotation = new THREE.Euler(0, 0, 0, 'YXZ');
  public headingAngle = 0; // Yaw in radians
  public speed = 0; // m/s
  public speedKmh = 0;
  public steerAngle = 0;
  public nitro = 100;
  public isNitroActive = false;
  public isOccupied = false;
  public headlightsOn = true;
  public radioStation = 1; // 1: Synthwave FM, 2: Cyber-Bass, 3: Nightfall Lo-Fi, 4: Off

  // Visual sub-meshes for animation
  private bodyMesh!: THREE.Mesh;
  private bodyMaterial!: THREE.MeshStandardMaterial;
  private wheels: THREE.Mesh[] = [];
  private frontWheelPivots: THREE.Group[] = [];
  private headLights: THREE.SpotLight[] = [];
  private tailLightMesh!: THREE.Mesh;
  private tailLightMat!: THREE.MeshBasicMaterial;
  private underglowLight!: THREE.PointLight;
  private underglowPlane!: THREE.Mesh;
  private nitroFlameMesh!: THREE.Mesh;
  private policeLightBar?: { red: THREE.PointLight; blue: THREE.PointLight; barMesh: THREE.Mesh };

  // Tuning & Customization
  public customization: VehicleCustomization = {
    paintColor: 0x00f2fe,
    underglowColor: 0x00f2fe,
    neonUnderglowEnabled: true,
    turboLevel: 2,
    nitroMax: 100,
  };

  constructor(
    public type: VehicleType,
    initialPos: THREE.Vector3,
    initialHeading: number,
    private collisionSystem: CollisionSystem,
    custom?: Partial<VehicleCustomization>
  ) {
    if (custom) {
      this.customization = { ...this.customization, ...custom };
    }
    this.position.copy(initialPos);
    this.headingAngle = initialHeading;

    this.buildVehicleMesh();
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.headingAngle;
  }

  private buildVehicleMesh() {
    if (this.type === 'SUPERCAR' || this.type === 'POLICE_CRUISER') {
      this.buildCarMesh();
    } else {
      this.buildSportBikeMesh();
    }

    // Add Underglow Neon Lighting
    this.setupUnderglow();

    // Add Headlights Spotlights
    this.setupHeadlights();

    // Add Nitro Exhaust Flame
    this.setupNitroFlame();
  }

  private buildCarMesh() {
    const isPolice = this.type === 'POLICE_CRUISER';
    const mainColor = isPolice ? 0x0f172a : this.customization.paintColor;

    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: 0.25,
      metalness: 0.85,
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.7,
      metalness: 0.3,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x001122,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6,
      ior: 1.5,
    });

    // 1. Lower Chassis
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.45, 4.4), this.bodyMaterial);
    lowerBody.position.y = 0.45;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    this.mesh.add(lowerBody);
    this.bodyMesh = lowerBody;

    // 2. Cockpit / Roof
    const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 2.0), glassMat);
    cockpit.position.set(0, 0.85, -0.2);
    cockpit.castShadow = true;
    this.mesh.add(cockpit);

    // Roof Top Carbon Shell
    const roofTop = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 1.6), carbonMat);
    roofTop.position.set(0, 1.1, -0.2);
    this.mesh.add(roofTop);

    // 3. Front Hood Slant & Aerodynamic Splitter
    const hoodSlant = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.25, 1.2), this.bodyMaterial);
    hoodSlant.position.set(0, 0.6, 1.4);
    hoodSlant.rotation.x = 0.15;
    this.mesh.add(hoodSlant);

    const splitter = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.08, 0.4), carbonMat);
    splitter.position.set(0, 0.25, 2.2);
    this.mesh.add(splitter);

    // 4. Rear Spoiler Wing
    const spoilerWing = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 0.4), carbonMat);
    spoilerWing.position.set(0, 1.05, -2.0);
    this.mesh.add(spoilerWing);

    const spoilerLeftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.15), carbonMat);
    spoilerLeftPillar.position.set(-0.7, 0.85, -2.0);
    this.mesh.add(spoilerLeftPillar);

    const spoilerRightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.15), carbonMat);
    spoilerRightPillar.position.set(0.7, 0.85, -2.0);
    this.mesh.add(spoilerRightPillar);

    // 5. Taillight Bar (Glows Red)
    this.tailLightMat = new THREE.MeshBasicMaterial({ color: 0xff1133 });
    this.tailLightMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.1), this.tailLightMat);
    this.tailLightMesh.position.set(0, 0.6, -2.2);
    this.mesh.add(this.tailLightMesh);

    // 6. Wheels (4 alloy wheels with tire and rim)
    const wheelRadius = 0.38;
    const wheelWidth = 0.26;
    const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24);
    wheelGeo.rotateZ(Math.PI / 2);

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x181818,
      roughness: 0.9,
      metalness: 0.1,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      roughness: 0.3,
      metalness: 0.9,
    });

    const createWheel = (isFront: boolean, isLeft: boolean) => {
      const group = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, tireMat);
      tire.castShadow = true;
      group.add(tire);

      // Rim Hub
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, wheelWidth + 0.02, 12), rimMat);
      rim.rotateZ(Math.PI / 2);
      group.add(rim);

      const xPos = isLeft ? -1.05 : 1.05;
      const zPos = isFront ? 1.35 : -1.35;

      if (isFront) {
        const pivot = new THREE.Group();
        pivot.position.set(xPos, wheelRadius, zPos);
        pivot.add(group);
        this.mesh.add(pivot);
        this.frontWheelPivots.push(pivot);
      } else {
        group.position.set(xPos, wheelRadius, zPos);
        this.mesh.add(group);
      }

      this.wheels.push(tire);
    };

    createWheel(true, true);
    createWheel(true, false);
    createWheel(false, true);
    createWheel(false, false);

    // 7. Police Decals & Strobe Lightbar (for Police Cruisers)
    if (isPolice) {
      this.setupPoliceCruiserAccessories();
    }
  }

  private buildSportBikeMesh() {
    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: this.customization.paintColor,
      roughness: 0.3,
      metalness: 0.8,
    });

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1a2434,
      roughness: 0.5,
      metalness: 0.6,
    });

    // Central Chassis
    const bikeFrame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 1.8), this.bodyMaterial);
    bikeFrame.position.y = 0.65;
    bikeFrame.castShadow = true;
    this.mesh.add(bikeFrame);
    this.bodyMesh = bikeFrame;

    // Handlebars
    const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 12), frameMat);
    handleBar.rotateZ(Math.PI / 2);
    handleBar.position.set(0, 0.95, 0.6);
    this.mesh.add(handleBar);

    // 2 Wheels
    const wheelRadius = 0.36;
    const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.2, 24);
    wheelGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });

    // Front Wheel Pivot
    const frontPivot = new THREE.Group();
    frontPivot.position.set(0, wheelRadius, 0.9);
    const frontWheel = new THREE.Mesh(wheelGeo, tireMat);
    frontPivot.add(frontWheel);
    this.mesh.add(frontPivot);
    this.frontWheelPivots.push(frontPivot);
    this.wheels.push(frontWheel);

    // Rear Wheel
    const rearWheel = new THREE.Mesh(wheelGeo, tireMat);
    rearWheel.position.set(0, wheelRadius, -0.9);
    this.mesh.add(rearWheel);
    this.wheels.push(rearWheel);

    // Taillight
    this.tailLightMat = new THREE.MeshBasicMaterial({ color: 0xff1133 });
    this.tailLightMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), this.tailLightMat);
    this.tailLightMesh.position.set(0, 0.7, -1.0);
    this.mesh.add(this.tailLightMesh);
  }

  private setupUnderglow() {
    this.underglowLight = new THREE.PointLight(this.customization.underglowColor, 2.5, 5);
    this.underglowLight.position.set(0, 0.1, 0);
    this.mesh.add(this.underglowLight);

    const glowGeo = new THREE.PlaneGeometry(2.4, 4.4);
    const glowMat = new THREE.MeshBasicMaterial({
      color: this.customization.underglowColor,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    this.underglowPlane = new THREE.Mesh(glowGeo, glowMat);
    this.underglowPlane.rotation.x = -Math.PI / 2;
    this.underglowPlane.position.y = 0.04;
    this.mesh.add(this.underglowPlane);
  }

  private setupHeadlights() {
    const createHeadlight = (x: number) => {
      const spot = new THREE.SpotLight(0xffffff, 3.5, 30, Math.PI / 7, 0.4, 1.2);
      spot.position.set(x, 0.5, 2.1);
      spot.target.position.set(x, 0, 15);
      this.mesh.add(spot);
      this.mesh.add(spot.target);
      this.headLights.push(spot);
    };

    createHeadlight(-0.65);
    createHeadlight(0.65);
  }

  private setupNitroFlame() {
    const flameGeo = new THREE.ConeGeometry(0.18, 0.8, 12);
    flameGeo.rotateX(Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x00d2fe,
      transparent: true,
      opacity: 0.85,
    });
    this.nitroFlameMesh = new THREE.Mesh(flameGeo, flameMat);
    this.nitroFlameMesh.position.set(0, 0.35, -2.4);
    this.nitroFlameMesh.visible = false;
    this.mesh.add(this.nitroFlameMesh);
  }

  private setupPoliceCruiserAccessories() {
    // Red & Blue flashing lightbar on roof
    const barGeo = new THREE.BoxGeometry(1.1, 0.12, 0.25);
    const barMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 });
    const barMesh = new THREE.Mesh(barGeo, barMat);
    barMesh.position.set(0, 1.2, -0.2);
    this.mesh.add(barMesh);

    const redLight = new THREE.PointLight(0xff0022, 0, 8);
    redLight.position.set(-0.35, 1.3, -0.2);
    this.mesh.add(redLight);

    const blueLight = new THREE.PointLight(0x0044ff, 0, 8);
    blueLight.position.set(0.35, 1.3, -0.2);
    this.mesh.add(blueLight);

    this.policeLightBar = { red: redLight, blue: blueLight, barMesh };
  }

  // --- Controls & Physics Simulation ---
  public update(
    delta: number,
    input: { forward: number; steer: number; brake: boolean; nitro: boolean; horn: boolean }
  ) {
    const maxSpeedForward = 36 * (1 + this.customization.turboLevel * 0.15); // ~130 - 150 km/h
    const maxSpeedReverse = 10;
    const acceleration = 24 * (1 + this.customization.turboLevel * 0.1);
    const brakingDecel = 32;
    const naturalDrag = 8.0;

    // 1. Nitro Boost
    if (input.nitro && this.nitro > 0 && input.forward > 0) {
      this.isNitroActive = true;
      this.nitro = Math.max(0, this.nitro - delta * 30);
      this.speed += acceleration * 1.8 * delta;
      this.nitroFlameMesh.visible = true;
      const scale = 0.8 + Math.random() * 0.4;
      this.nitroFlameMesh.scale.set(scale, scale, scale * 1.4);
      gameAudio.playNitroBoost();
    } else {
      this.isNitroActive = false;
      this.nitroFlameMesh.visible = false;
      this.nitro = Math.min(this.customization.nitroMax, this.nitro + delta * 8);
    }

    // 2. Throttle & Braking
    if (input.forward > 0) {
      const topSpeed = this.isNitroActive ? maxSpeedForward * 1.35 : maxSpeedForward;
      this.speed = Math.min(topSpeed, this.speed + acceleration * input.forward * delta);
    } else if (input.forward < 0) {
      if (this.speed > 0.5) {
        // Braking
        this.speed = Math.max(0, this.speed - brakingDecel * delta);
      } else {
        // Reversing
        this.speed = Math.max(-maxSpeedReverse, this.speed - acceleration * 0.5 * delta);
      }
    } else {
      // Coasting / Friction
      if (this.speed > 0) {
        this.speed = Math.max(0, this.speed - naturalDrag * delta);
      } else if (this.speed < 0) {
        this.speed = Math.min(0, this.speed + naturalDrag * delta);
      }
    }

    // Handbrake
    if (input.brake) {
      if (Math.abs(this.speed) > 5) {
        gameAudio.playTireScreech();
      }
      this.speed *= Math.max(0, 1 - brakingDecel * 0.08 * delta);
    }

    // Taillight Brake glow
    if (this.tailLightMat) {
      if (input.brake || input.forward < 0) {
        this.tailLightMat.color.setHex(0xff0000);
      } else {
        this.tailLightMat.color.setHex(0x550011);
      }
    }

    // 3. Steering & Turning Radius
    const speedRatio = Math.min(Math.abs(this.speed) / maxSpeedForward, 1.0);
    const maxSteer = 0.65 - speedRatio * 0.35; // tighter turning at low speed
    const steerSpeed = 4.0;

    if (input.steer !== 0) {
      this.steerAngle = THREE.MathUtils.lerp(this.steerAngle, input.steer * maxSteer, steerSpeed * delta);
    } else {
      this.steerAngle = THREE.MathUtils.lerp(this.steerAngle, 0, steerSpeed * 1.5 * delta);
    }

    // Rotate front wheel pivots
    for (const pivot of this.frontWheelPivots) {
      pivot.rotation.y = this.steerAngle;
    }

    // Update Heading Angle if moving
    if (Math.abs(this.speed) > 0.1) {
      const turnMultiplier = this.speed >= 0 ? 1 : -1;
      this.headingAngle -= this.steerAngle * (this.speed / 8.5) * turnMultiplier * delta;
    }

    this.mesh.rotation.y = this.headingAngle;

    // 4. Calculate proposed movement
    const forwardX = Math.sin(this.headingAngle) * this.speed * delta;
    const forwardZ = Math.cos(this.headingAngle) * this.speed * delta;
    const nextPos = this.position.clone().add(new THREE.Vector3(forwardX, 0, forwardZ));

    // Collision check against city obstacles
    const radius = 1.3;
    const resolvedPos = this.collisionSystem.resolveSphereCollision(nextPos, radius);
    if (resolvedPos.distanceTo(nextPos) > 0.01) {
      // Hit a wall or obstacle: rebound velocity
      this.speed = -this.speed * 0.3;
      gameAudio.playLand();
    }
    this.position.copy(resolvedPos);
    this.mesh.position.copy(this.position);

    // 5. Spin wheels based on ground velocity
    const wheelRotDelta = (this.speed * delta) / 0.38;
    for (const wheel of this.wheels) {
      wheel.rotation.x += wheelRotDelta;
    }

    // 6. Update telemetry metrics
    this.speedKmh = Math.round(Math.abs(this.speed) * 3.6);

    // Audio engine pitch
    if (this.isOccupied) {
      gameAudio.updateEngineSound(this.speedKmh, true, this.isNitroActive);
    }

    // Horn
    if (input.horn) {
      gameAudio.playCarHorn();
    }

    // Police Strobe animation
    if (this.policeLightBar) {
      const time = performance.now() * 0.008;
      const redIntensity = Math.sin(time * 3) > 0 ? 4 : 0;
      const blueIntensity = Math.sin(time * 3 + Math.PI) > 0 ? 4 : 0;
      this.policeLightBar.red.intensity = redIntensity;
      this.policeLightBar.blue.intensity = blueIntensity;
    }
  }

  // Customization setters
  public setPaintColor(colorHex: number) {
    this.customization.paintColor = colorHex;
    this.bodyMaterial.color.setHex(colorHex);
  }

  public setUnderglowColor(colorHex: number) {
    this.customization.underglowColor = colorHex;
    this.underglowLight.color.setHex(colorHex);
    (this.underglowPlane.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
  }

  public toggleHeadlights() {
    this.headlightsOn = !this.headlightsOn;
    for (const light of this.headLights) {
      light.intensity = this.headlightsOn ? 3.5 : 0;
    }
    return this.headlightsOn;
  }

  public cycleRadioStation(): string {
    this.radioStation = (this.radioStation % 4) + 1;
    gameAudio.playRadioBeat(this.radioStation);
    const stations = [
      'NEON WAVE 94.7 FM',
      'CYBER-BASS ELECTRONICA',
      'NIGHTFALL LO-FI BEATS',
      'RÁDIO DESLIGADA',
    ];
    return stations[this.radioStation - 1];
  }
}
