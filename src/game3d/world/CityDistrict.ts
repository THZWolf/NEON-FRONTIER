import * as THREE from 'three';
import { CollisionSystem } from './Collisions';

export interface DistrictVenue {
  id: string;
  name: string;
  type: 'GARAGE' | 'NIGHTCLUB' | 'AMMUNATION' | 'HEIST' | 'ARCADE' | 'YACHT';
  position: THREE.Vector3;
  prompt: string;
}

export class CityDistrict {
  public group = new THREE.Group();
  public obeliskMesh!: THREE.Mesh;
  public interactiveTerminals: { id: string; name: string; position: THREE.Vector3; mesh: THREE.Group }[] = [];
  public venues: DistrictVenue[] = [];
  private neonLights: THREE.PointLight[] = [];
  private waterMesh?: THREE.Mesh;
  private nightclubLasers: THREE.SpotLight[] = [];
  private distantSkylineGroup = new THREE.Group();

  constructor(private collisionSystem: CollisionSystem) {
    this.buildDistrict();
  }

  private buildDistrict() {
    this.createGroundAndRoads();
    this.createCentralPlaza();
    this.createVenuesAndBuildings();
    this.createHarborAndMegayacht();
    this.createFreewayOverpass();
    this.createStreetFurniture();
    this.createDistantSkyline();
    this.createPerimeterBoundaries();
  }

  // 1. Asphalt Streets, Crosswalks & Neon Road Markings
  private createGroundAndRoads() {
    // Base district ground
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a101d,
      roughness: 0.85,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.group.add(ground);

    // Glowing cyan dashed road grid
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0c1422';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 5;
    ctx.setLineDash([26, 18]);
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.moveTo(0, 256);
    ctx.lineTo(512, 256);
    ctx.stroke();

    const roadTex = new THREE.CanvasTexture(canvas);
    roadTex.wrapS = THREE.RepeatWrapping;
    roadTex.wrapT = THREE.RepeatWrapping;
    roadTex.repeat.set(5, 5);
    roadTex.colorSpace = THREE.SRGBColorSpace;

    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.8,
      metalness: 0.25,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.y = 0.02;
    roadMesh.receiveShadow = true;
    this.group.add(roadMesh);
  }

  // 2. Central Nexus Plaza with Rotating Holographic Obelisk
  private createCentralPlaza() {
    const plazaGroup = new THREE.Group();

    // Circular plaza platform
    const platformGeo = new THREE.CylinderGeometry(14, 15, 0.4, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x142033,
      roughness: 0.5,
      metalness: 0.4,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = 0.2;
    platform.receiveShadow = true;
    plazaGroup.add(platform);

    // Outer neon ring inlay
    const ringGeo = new THREE.RingGeometry(11.8, 12.3, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.42;
    plazaGroup.add(ring);

    // Central Obelisk Base Pedestal
    const baseGeo = new THREE.CylinderGeometry(2, 2.5, 1.2, 8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1b2d47,
      roughness: 0.3,
      metalness: 0.7,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 1.0;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    plazaGroup.add(baseMesh);

    this.collisionSystem.addBox(
      new THREE.Box3(new THREE.Vector3(-2.2, 0, -2.2), new THREE.Vector3(2.2, 2.0, 2.2)),
      'obelisk_base'
    );

    // Floating Rotating Crystal Obelisk
    const obeliskGeo = new THREE.OctahedronGeometry(1.6, 0);
    const obeliskMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x00d2fe,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9,
    });
    this.obeliskMesh = new THREE.Mesh(obeliskGeo, obeliskMat);
    this.obeliskMesh.position.y = 3.6;
    plazaGroup.add(this.obeliskMesh);

    const plazaLight = new THREE.PointLight(0x00f2fe, 3, 24);
    plazaLight.position.set(0, 4, 0);
    plazaGroup.add(plazaLight);
    this.neonLights.push(plazaLight);

    this.group.add(plazaGroup);
  }

  // 3. Iconic Themed Venues (Auto-Mod, Nightclub, Ammu-Nation, Heist, Arcade)
  private createVenuesAndBuildings() {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x111c2e, roughness: 0.7, metalness: 0.4 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x091424, roughness: 0.2, metalness: 0.8 });

    // A. AUTO-MOD 31 TUNING GARAGE (Top-Right: x: 26, z: -24)
    {
      const garageGroup = new THREE.Group();
      garageGroup.position.set(26, 0, -24);

      const bldg = new THREE.Mesh(new THREE.BoxGeometry(22, 14, 20), wallMat);
      bldg.position.y = 7;
      bldg.castShadow = true;
      garageGroup.add(bldg);

      // Open garage bay arch
      const bayEntrance = new THREE.Mesh(
        new THREE.BoxGeometry(8, 6, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x050b14, roughness: 0.9 })
      );
      bayEntrance.position.set(0, 3, 10.1);
      garageGroup.add(bayEntrance);

      // Hydraulic lift platform
      const lift = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 0.25, 6),
        new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.8 })
      );
      lift.position.set(0, 0.15, 6);
      garageGroup.add(lift);

      // Neon Sign "AUTO-MOD 31"
      const sign = this.createCanvasSign('AUTO-MOD 31', '#00f2fe', '#060d17', 10, 2.5);
      sign.position.set(0, 9, 10.2);
      garageGroup.add(sign);

      const garageLight = new THREE.PointLight(0x00f2fe, 3, 16);
      garageLight.position.set(0, 7, 12);
      garageGroup.add(garageLight);
      this.neonLights.push(garageLight);

      this.group.add(garageGroup);
      this.collisionSystem.addBox(
        new THREE.Box3(new THREE.Vector3(15, 0, -34), new THREE.Vector3(37, 14, -14)),
        'bldg_automod'
      );

      this.venues.push({
        id: 'venue_automod',
        name: 'AUTO-MOD 31 Garage',
        type: 'GARAGE',
        position: new THREE.Vector3(26, 0, -14),
        prompt: '[E] Customizar Veículo (Pintura, Neon, Turbo) — AUTO-MOD 31',
      });
    }

    // B. THE CYBER-DOME / CYBERIA NIGHTCLUB (Top-Left: x: -26, z: -24)
    {
      const clubGroup = new THREE.Group();
      clubGroup.position.set(-26, 0, -24);

      const bldg = new THREE.Mesh(new THREE.BoxGeometry(22, 18, 20), wallMat);
      bldg.position.y = 9;
      bldg.castShadow = true;
      clubGroup.add(bldg);

      // Sign "THE CYBER-DOME"
      const sign = this.createCanvasSign('THE CYBER-DOME', '#ff0077', '#080010', 11, 2.6);
      sign.position.set(0, 11, 10.2);
      clubGroup.add(sign);

      // Facade Neon Light
      const clubLight = new THREE.PointLight(0xff0077, 3.5, 20);
      clubLight.position.set(0, 8, 12);
      clubGroup.add(clubLight);
      this.neonLights.push(clubLight);

      // Sky laser beams shooting up from the nightclub roof
      for (const offset of [-4, 4]) {
        const laserSpot = new THREE.SpotLight(0xff0077, 8, 90, 0.08, 0.1);
        laserSpot.position.set(offset, 18, 0);
        laserSpot.target.position.set(offset * 2, 80, -10);
        clubGroup.add(laserSpot);
        clubGroup.add(laserSpot.target);
        this.nightclubLasers.push(laserSpot);
      }

      this.group.add(clubGroup);
      this.collisionSystem.addBox(
        new THREE.Box3(new THREE.Vector3(-37, 0, -34), new THREE.Vector3(-15, 18, -14)),
        'bldg_cyberdome'
      );

      this.venues.push({
        id: 'venue_club',
        name: 'The Cyber-Dome Nightclub',
        type: 'NIGHTCLUB',
        position: new THREE.Vector3(-26, 0, -14),
        prompt: '[E] Entrar no Cyber-Dome (Pista de Dança & DJ Booth)',
      });
    }

    // C. AMMU-NATION ARSENAL & TACTICAL (Bottom-Right: x: 26, z: 24)
    {
      const gunGroup = new THREE.Group();
      gunGroup.position.set(26, 0, 24);

      const bldg = new THREE.Mesh(new THREE.BoxGeometry(22, 14, 20), wallMat);
      bldg.position.y = 7;
      bldg.castShadow = true;
      gunGroup.add(bldg);

      const sign = this.createCanvasSign('AMMU-NATION', '#ff3344', '#100508', 10, 2.5);
      sign.position.set(0, 9, -10.2);
      sign.rotation.y = Math.PI;
      gunGroup.add(sign);

      const gunLight = new THREE.PointLight(0xff3344, 2.5, 16);
      gunLight.position.set(0, 7, -12);
      gunGroup.add(gunLight);
      this.neonLights.push(gunLight);

      this.group.add(gunGroup);
      this.collisionSystem.addBox(
        new THREE.Box3(new THREE.Vector3(15, 0, 14), new THREE.Vector3(37, 14, 34)),
        'bldg_ammunation'
      );

      this.venues.push({
        id: 'venue_ammunation',
        name: 'Ammu-Nation Armory',
        type: 'AMMUNATION',
        position: new THREE.Vector3(26, 0, 14),
        prompt: '[E] Comprar Armas & Munições — AMMU-NATION',
      });
    }

    // D. HEIST PLANNING ROOM / SAFEHOUSE (Bottom-Left: x: -26, z: 24)
    {
      const heistGroup = new THREE.Group();
      heistGroup.position.set(-26, 0, 24);

      const bldg = new THREE.Mesh(new THREE.BoxGeometry(22, 16, 20), wallMat);
      bldg.position.y = 8;
      bldg.castShadow = true;
      heistGroup.add(bldg);

      const sign = this.createCanvasSign('HEIST HEADQUARTERS', '#ffaa00', '#100a00', 11, 2.5);
      sign.position.set(0, 10, -10.2);
      sign.rotation.y = Math.PI;
      heistGroup.add(sign);

      const heistLight = new THREE.PointLight(0xffaa00, 2.5, 16);
      heistLight.position.set(0, 7, -12);
      heistGroup.add(heistLight);
      this.neonLights.push(heistLight);

      this.group.add(heistGroup);
      this.collisionSystem.addBox(
        new THREE.Box3(new THREE.Vector3(-37, 0, 14), new THREE.Vector3(-15, 16, 34)),
        'bldg_heist'
      );

      this.venues.push({
        id: 'venue_heist',
        name: 'Sala de Preparação de Golpe',
        type: 'HEIST',
        position: new THREE.Vector3(-26, 0, 14),
        prompt: '[E] Mesa Holográfica de Golpes (Assaltos & Hackeamento)',
      });
    }

    // E. ARCADE-198X (South Center: x: 0, z: 38)
    {
      const arcadeGroup = new THREE.Group();
      arcadeGroup.position.set(0, 0, 38);

      const bldg = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 16), wallMat);
      bldg.position.y = 6;
      bldg.castShadow = true;
      arcadeGroup.add(bldg);

      const sign = this.createCanvasSign('ARCADE-198X', '#00f2fe', '#050c18', 9, 2.4);
      sign.position.set(0, 8, -8.2);
      sign.rotation.y = Math.PI;
      arcadeGroup.add(sign);

      const arcLight = new THREE.PointLight(0x00f2fe, 2.5, 15);
      arcLight.position.set(0, 6, -10);
      arcadeGroup.add(arcLight);
      this.neonLights.push(arcLight);

      this.group.add(arcadeGroup);
      this.collisionSystem.addBox(
        new THREE.Box3(new THREE.Vector3(-10, 0, 30), new THREE.Vector3(10, 12, 46)),
        'bldg_arcade'
      );

      this.venues.push({
        id: 'venue_arcade',
        name: 'Arcade-198X',
        type: 'ARCADE',
        position: new THREE.Vector3(0, 0, 30),
        prompt: '[E] Jogar Minijogo Retrô — ARCADE-198X',
      });
    }
  }

  // 4. Harbor Marina & Luxury Megayacht with Pool Deck & Helipad
  private createHarborAndMegayacht() {
    const harborZ = -60;

    // Water Surface (animated in update)
    const waterGeo = new THREE.PlaneGeometry(160, 40, 16, 16);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x03182b,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.88,
    });
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.set(0, -0.4, harborZ);
    this.group.add(this.waterMesh);

    // Dock Pier Boardwalk
    const pierGeo = new THREE.BoxGeometry(160, 1.2, 8);
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x182434, roughness: 0.7 });
    const pier = new THREE.Mesh(pierGeo, pierMat);
    pier.position.set(0, 0.2, harborZ + 18);
    this.group.add(pier);

    // Harbor Marina Boarding Prompt
    this.venues.push({
      id: 'venue_yacht',
      name: 'Megaiate de Luxo Neon',
      type: 'YACHT',
      position: new THREE.Vector3(0, 0, harborZ + 15),
      prompt: '[E] Embarcar no Megaiate de Luxo (Deck VIP & Jacuzzi)',
    });

    // Luxury Megayacht 3D Model
    const yachtGroup = new THREE.Group();
    yachtGroup.position.set(0, 0, harborZ);

    const hullMat = new THREE.MeshStandardMaterial({ color: 0x22364c, roughness: 0.2, metalness: 0.6 });
    const deckMat = new THREE.MeshStandardMaterial({ color: 0xb58b57, roughness: 0.6 }); // Teak wood
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x00f2fe, roughness: 0.1, metalness: 0.9 });

    // Lower Hull
    const hull = new THREE.Mesh(new THREE.BoxGeometry(10, 3, 26), hullMat);
    hull.position.y = 1.0;
    yachtGroup.add(hull);

    // Hull Neon Underline Accent (Purple/Magenta)
    const hullGlow = new THREE.Mesh(
      new THREE.BoxGeometry(10.2, 0.15, 26.2),
      new THREE.MeshBasicMaterial({ color: 0xff00aa })
    );
    hullGlow.position.y = 0.8;
    yachtGroup.add(hullGlow);

    // Main Deck Teak
    const deck = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.2, 25.6), deckMat);
    deck.position.y = 2.6;
    yachtGroup.add(deck);

    // Upper Bridge Cabin
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.2, 12), hullMat);
    bridge.position.set(0, 4.2, -2);
    yachtGroup.add(bridge);

    // Panoramic Bridge Glass
    const bridgeGlass = new THREE.Mesh(new THREE.BoxGeometry(6.6, 1.2, 6), glassMat);
    bridgeGlass.position.set(0, 4.5, -4);
    yachtGroup.add(bridgeGlass);

    // Glowing Cyan Jacuzzi Pool on Aft Deck
    const poolGeo = new THREE.CylinderGeometry(2, 2, 0.4, 16);
    const poolMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const pool = new THREE.Mesh(poolGeo, poolMat);
    pool.position.set(0, 2.7, 7);
    yachtGroup.add(pool);

    const poolLight = new THREE.PointLight(0x00f2fe, 2.5, 10);
    poolLight.position.set(0, 3.5, 7);
    yachtGroup.add(poolLight);

    // Helipad marking on top deck
    const helipad = new THREE.Mesh(
      new THREE.CircleGeometry(2.5, 24),
      new THREE.MeshBasicMaterial({ color: 0xffaa00, side: THREE.DoubleSide })
    );
    helipad.rotation.x = -Math.PI / 2;
    helipad.position.set(0, 5.85, -2);
    yachtGroup.add(helipad);

    this.group.add(yachtGroup);
  }

  // 5. Elevated Freeway Overpass & Bridge
  private createFreewayOverpass() {
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(0, 6, 0);

    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x1c2b3d, roughness: 0.7 });
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0x334860, metalness: 0.8 });

    // East-West elevated roadway
    const road = new THREE.Mesh(new THREE.BoxGeometry(150, 0.8, 8), concreteMat);
    bridgeGroup.add(road);

    // Side safety barriers
    for (const z of [-3.9, 3.9]) {
      const barrier = new THREE.Mesh(new THREE.BoxGeometry(150, 0.9, 0.2), barrierMat);
      barrier.position.set(0, 0.6, z);
      bridgeGroup.add(barrier);

      const neonStrip = new THREE.Mesh(
        new THREE.BoxGeometry(150, 0.08, 0.05),
        new THREE.MeshBasicMaterial({ color: 0x00f2fe })
      );
      neonStrip.position.set(0, 1.05, z);
      bridgeGroup.add(neonStrip);
    }

    // Support pillars
    for (const x of [-45, -15, 15, 45]) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 6, 12), concreteMat);
      pillar.position.set(x, -3, 0);
      bridgeGroup.add(pillar);

      this.collisionSystem.addBox(
        new THREE.Box3(new THREE.Vector3(x - 1.4, 0, -1.4), new THREE.Vector3(x + 1.4, 6, 1.4)),
        `overpass_pillar_${x}`
      );
    }

    this.group.add(bridgeGroup);
  }

  // 6. Streetlamps & Cyber Benches
  private createStreetFurniture() {
    const lampCoords: [number, number][] = [
      [-16, -16],
      [16, -16],
      [-16, 16],
      [16, 16],
      [-16, 0],
      [16, 0],
      [0, -16],
      [0, 16],
    ];

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x223246, metalness: 0.8, roughness: 0.3 });
    const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });

    lampCoords.forEach(([lx, lz], i) => {
      const lampGroup = new THREE.Group();
      lampGroup.position.set(lx, 0, lz);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 5.5, 8), poleMat);
      pole.position.y = 2.75;
      pole.castShadow = true;
      lampGroup.add(pole);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.3), lampHeadMat);
      head.position.set(0.6, 5.3, 0);
      lampGroup.add(head);

      const lampLight = new THREE.PointLight(0x00f2fe, 1.8, 14);
      lampLight.position.set(0.6, 5.0, 0);
      lampGroup.add(lampLight);
      this.neonLights.push(lampLight);

      this.group.add(lampGroup);
      this.collisionSystem.addBox(
        new THREE.Box3(new THREE.Vector3(lx - 0.3, 0, lz - 0.3), new THREE.Vector3(lx + 0.3, 5.5, lz + 0.3)),
        `lamp_${i}`
      );
    });

    // Interactive Terminals
    const terminalDefs = [
      { id: 'term_plaza', name: 'Terminal da Praça Central', pos: new THREE.Vector3(4, 0, 7) },
      { id: 'term_harbor', name: 'Terminal do Porto & Marinha', pos: new THREE.Vector3(-14, 0, -38) },
    ];

    terminalDefs.forEach((t) => {
      const termGroup = new THREE.Group();
      termGroup.position.copy(t.pos);

      const ped = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.4, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x19273a, roughness: 0.4, metalness: 0.7 })
      );
      ped.position.y = 0.7;
      termGroup.add(ped);

      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 0.45),
        new THREE.MeshBasicMaterial({ color: 0x00f2fe, side: THREE.DoubleSide })
      );
      screen.rotation.x = -Math.PI / 4;
      screen.position.set(0, 1.35, 0.1);
      termGroup.add(screen);

      this.group.add(termGroup);
      this.interactiveTerminals.push({ id: t.id, name: t.name, position: t.pos.clone(), mesh: termGroup });
    });
  }

  // 7. Distant Megacity Skyline Silhouettes & Giant Glowing Moon
  private createDistantSkyline() {
    const skylineMat = new THREE.MeshBasicMaterial({ color: 0x08101e });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x224466 });

    // Distant background tower clusters
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const dist = 100 + (i % 3) * 15;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const w = 12 + Math.random() * 14;
      const h = 40 + Math.random() * 60;

      const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), skylineMat);
      tower.position.set(x, h / 2 - 10, z);
      this.distantSkylineGroup.add(tower);

      // Window grid streak
      const win = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, h * 0.7, w + 0.1), windowMat);
      win.position.set(x, h / 2 - 10, z);
      this.distantSkylineGroup.add(win);
    }

    // Giant Glowing Moon in the sky
    const moonGeo = new THREE.SphereGeometry(14, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xddeeff });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(60, 95, -120);
    this.distantSkylineGroup.add(moon);

    this.group.add(this.distantSkylineGroup);
  }

  // Helper: Canvas Neon Sign
  private createCanvasSign(text: string, color: string, bg: string, width: number, height: number): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);

    ctx.fillStyle = color;
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: texture });
    return new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
  }

  // 8. Perimeter boundaries
  private createPerimeterBoundaries() {
    const boundSize = 72;
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x0b1320, roughness: 0.6 });

    const walls: [number, number, number, number][] = [
      [0, -boundSize, boundSize * 2, 2],
      [0, boundSize, boundSize * 2, 2],
      [-boundSize, 0, 2, boundSize * 2],
      [boundSize, 0, 2, boundSize * 2],
    ];

    walls.forEach(([wx, wz, ww, wd], i) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(ww, 4, wd), fenceMat);
      wall.position.set(wx, 2, wz);
      this.group.add(wall);

      this.collisionSystem.addBox(
        new THREE.Box3(new THREE.Vector3(wx - ww / 2, 0, wz - wd / 2), new THREE.Vector3(wx + ww / 2, 6, wz + wd / 2)),
        `perimeter_${i}`
      );
    });
  }

  // Find closest venue to player
  public getClosestVenue(pos: THREE.Vector3, maxDist: number = 4.0): DistrictVenue | null {
    let closest: DistrictVenue | null = null;
    let minDist = maxDist;

    for (const v of this.venues) {
      const d = v.position.distanceTo(pos);
      if (d < minDist) {
        minDist = d;
        closest = v;
      }
    }
    return closest;
  }

  // Update dynamic animations
  public update(delta: number, elapsed: number) {
    if (this.obeliskMesh) {
      this.obeliskMesh.rotation.y += delta * 0.8;
      this.obeliskMesh.position.y = 3.6 + Math.sin(elapsed * 2.0) * 0.15;
    }

    // Oscillate nightclub sky lasers
    this.nightclubLasers.forEach((laser, idx) => {
      const offset = idx === 0 ? 1 : -1;
      laser.target.position.x = Math.sin(elapsed * 1.5 + idx) * 30 * offset;
    });

    // Water surface undulating ripples
    if (this.waterMesh) {
      this.waterMesh.position.y = -0.4 + Math.sin(elapsed * 1.2) * 0.08;
    }
  }
}
