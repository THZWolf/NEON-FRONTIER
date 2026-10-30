import * as THREE from 'three';
import { CollisionSystem } from './Collisions';

export class CityDistrict {
  public group = new THREE.Group();
  public obeliskMesh!: THREE.Mesh;
  public interactiveTerminals: { id: string; name: string; position: THREE.Vector3; mesh: THREE.Group }[] = [];
  private neonLights: THREE.PointLight[] = [];

  constructor(private collisionSystem: CollisionSystem) {
    this.buildDistrict();
  }

  private buildDistrict() {
    this.createGroundAndRoads();
    this.createCentralPlaza();
    this.createBuildings();
    this.createStreetFurniture();
    this.createPerimeterBoundaries();
  }

  // 1. Asphalt Streets & Sidewalks
  private createGroundAndRoads() {
    // Base asphalt ground
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0c121d,
      roughness: 0.85,
      metalness: 0.15,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.group.add(ground);

    // Grid road markings
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0f1726';
    ctx.fillRect(0, 0, 512, 512);

    // Glowing cyan dashed road lines
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 6;
    ctx.setLineDash([24, 20]);
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.moveTo(0, 256);
    ctx.lineTo(512, 256);
    ctx.stroke();

    const roadTex = new THREE.CanvasTexture(canvas);
    roadTex.wrapS = THREE.RepeatWrapping;
    roadTex.wrapT = THREE.RepeatWrapping;
    roadTex.repeat.set(4, 4);
    roadTex.colorSpace = THREE.SRGBColorSpace;

    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.8,
      metalness: 0.2,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.y = 0.02; // contact offset
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

    // Add collision for base
    this.collisionSystem.addBox(
      new THREE.Box3(
        new THREE.Vector3(-2.2, 0, -2.2),
        new THREE.Vector3(2.2, 2.0, 2.2)
      ),
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

    // Plaza ambient glow light
    const plazaLight = new THREE.PointLight(0x00f2fe, 3, 24);
    plazaLight.position.set(0, 4, 0);
    plazaGroup.add(plazaLight);
    this.neonLights.push(plazaLight);

    this.group.add(plazaGroup);
  }

  // 3. Buildings with Glowing Neon Signs & Roof Spire Antennas
  private createBuildings() {
    // Cyberpunk building coordinates: [x, z, width, depth, height, colorHex, signText]
    const buildingDefs: [number, number, number, number, number, number, string][] = [
      [-36, -36, 22, 22, 38, 0x00f2fe, 'NEXUS-01'],
      [36, -36, 24, 22, 44, 0xff5fa2, 'CYBER-CORP'],
      [-36, 36, 20, 24, 32, 0xffd166, 'DATA-VAULT'],
      [36, 36, 22, 20, 50, 0x00f2fe, 'SYNDICATE'],
      [-42, 0, 16, 22, 26, 0xff5fa2, 'METRO-LINE'],
      [42, 0, 16, 22, 30, 0xffd166, 'SYNTH-HQ'],
      [0, -48, 28, 14, 34, 0x00f2fe, 'ORBITAL-LINK'],
      [0, 48, 26, 14, 28, 0xff5fa2, 'DISTRICT-7'],
    ];

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x111c2e,
      roughness: 0.7,
      metalness: 0.4,
    });

    const windowGlassMat = new THREE.MeshStandardMaterial({
      color: 0x091424,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x06182a,
      emissiveIntensity: 0.4,
    });

    buildingDefs.forEach(([x, z, w, d, h, neonColor, signText], idx) => {
      const bldgGroup = new THREE.Group();
      bldgGroup.position.set(x, 0, z);

      // Main structural block
      const bldgGeo = new THREE.BoxGeometry(w, h, d);
      const bldgMesh = new THREE.Mesh(bldgGeo, wallMat);
      bldgMesh.position.y = h / 2;
      bldgMesh.castShadow = true;
      bldgMesh.receiveShadow = true;
      bldgGroup.add(bldgMesh);

      // Upper architectural tier
      const tierH = h * 0.25;
      const tierMesh = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.75, tierH, d * 0.75),
        windowGlassMat
      );
      tierMesh.position.y = h + tierH / 2;
      bldgGroup.add(tierMesh);

      // Rooftop antenna tower
      const spireH = 8;
      const spire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.4, spireH, 6),
        new THREE.MeshStandardMaterial({ color: 0x5a7894, metalness: 0.9, roughness: 0.2 })
      );
      spire.position.y = h + tierH + spireH / 2;
      bldgGroup.add(spire);

      // Warning beacon light on top of antenna
      const beaconLight = new THREE.PointLight(0xff3344, 1.5, 12);
      beaconLight.position.y = h + tierH + spireH;
      bldgGroup.add(beaconLight);

      // Neon Signboard Canvas Texture
      const signCanvas = document.createElement('canvas');
      signCanvas.width = 256;
      signCanvas.height = 64;
      const sctx = signCanvas.getContext('2d')!;
      sctx.fillStyle = '#060d17';
      sctx.fillRect(0, 0, 256, 64);
      sctx.strokeStyle = neonColor === 0x00f2fe ? '#00f2fe' : neonColor === 0xff5fa2 ? '#ff5fa2' : '#ffd166';
      sctx.lineWidth = 4;
      sctx.strokeRect(4, 4, 248, 56);
      sctx.fillStyle = sctx.strokeStyle;
      sctx.font = 'bold 26px sans-serif';
      sctx.textAlign = 'center';
      sctx.textBaseline = 'middle';
      sctx.fillText(signText, 128, 32);

      const signTex = new THREE.CanvasTexture(signCanvas);
      signTex.colorSpace = THREE.SRGBColorSpace;
      const signMat = new THREE.MeshBasicMaterial({ map: signTex });

      // Front sign
      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), signMat);
      // Determine orientation toward center plaza
      const angleToCenter = Math.atan2(-z, -x);
      signMesh.rotation.y = angleToCenter + Math.PI / 2;
      signMesh.position.set(0, h * 0.6, d / 2 + 0.1);
      bldgGroup.add(signMesh);

      // Glowing facade light
      const facadeLight = new THREE.PointLight(neonColor, 2.0, 18);
      facadeLight.position.set(0, h * 0.6, d / 2 + 1.5);
      bldgGroup.add(facadeLight);
      this.neonLights.push(facadeLight);

      this.group.add(bldgGroup);

      // Register collision box for this building
      const halfW = w / 2;
      const halfD = d / 2;
      this.collisionSystem.addBox(
        new THREE.Box3(
          new THREE.Vector3(x - halfW, 0, z - halfD),
          new THREE.Vector3(x + halfW, h + tierH, z + halfD)
        ),
        `building_${idx}`
      );
    });
  }

  // 4. Streetlamps, Interactive Data Terminals, Benches & Props
  private createStreetFurniture() {
    // Streetlamp positions surrounding the central square
    const lampCoords: [number, number][] = [
      [-16, -16],
      [16, -16],
      [-16, 16],
      [16, 16],
      [-16, 0],
      [16, 0],
      [0, -16],
      [0, 16],
      [-28, -28],
      [28, 28],
    ];

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x223246, metalness: 0.8, roughness: 0.3 });
    const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });

    lampCoords.forEach(([lx, lz], i) => {
      const lampGroup = new THREE.Group();
      lampGroup.position.set(lx, 0, lz);

      // Vertical pole
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 5.5, 8), poleMat);
      pole.position.y = 2.75;
      pole.castShadow = true;
      lampGroup.add(pole);

      // Horizontal bracket
      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.12), poleMat);
      bracket.position.set(0.3, 5.4, 0);
      lampGroup.add(bracket);

      // Emissive lamp head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.3), lampHeadMat);
      head.position.set(0.6, 5.3, 0);
      lampGroup.add(head);

      // Point light casting downward illumination
      const lampLight = new THREE.PointLight(0x00f2fe, 1.8, 14);
      lampLight.position.set(0.6, 5.0, 0);
      lampLight.castShadow = i % 2 === 0; // limit shadow casters for performance
      lampGroup.add(lampLight);
      this.neonLights.push(lampLight);

      this.group.add(lampGroup);

      // Collision pole
      this.collisionSystem.addBox(
        new THREE.Box3(
          new THREE.Vector3(lx - 0.3, 0, lz - 0.3),
          new THREE.Vector3(lx + 0.3, 5.5, lz + 0.3)
        ),
        `lamp_${i}`
      );
    });

    // Interactive Cyber Data Terminals
    const terminalDefs = [
      { id: 'term_plaza', name: 'Terminal da Praça Central', pos: new THREE.Vector3(6, 0, 8) },
      { id: 'term_alley', name: 'Terminal de Dados Beco Leste', pos: new THREE.Vector3(22, 0, -4) },
      { id: 'term_west', name: 'Terminal do Bairro Comercial', pos: new THREE.Vector3(-22, 0, 6) },
    ];

    terminalDefs.forEach((t) => {
      const termGroup = new THREE.Group();
      termGroup.position.copy(t.pos);

      // Base pedestal
      const ped = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.4, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x19273a, roughness: 0.4, metalness: 0.7 })
      );
      ped.position.y = 0.7;
      termGroup.add(ped);

      // Angled holographic screen
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 0.45),
        new THREE.MeshBasicMaterial({ color: 0x00f2fe, side: THREE.DoubleSide })
      );
      screen.rotation.x = -Math.PI / 4;
      screen.position.set(0, 1.35, 0.1);
      termGroup.add(screen);

      // Subtle pulse light
      const tLight = new THREE.PointLight(0x00f2fe, 1.2, 5);
      tLight.position.set(0, 1.5, 0.3);
      termGroup.add(tLight);

      this.group.add(termGroup);

      this.collisionSystem.addBox(
        new THREE.Box3(
          new THREE.Vector3(t.pos.x - 0.5, 0, t.pos.z - 0.5),
          new THREE.Vector3(t.pos.x + 0.5, 1.6, t.pos.z + 0.5)
        ),
        t.id
      );

      this.interactiveTerminals.push({
        id: t.id,
        name: t.name,
        position: t.pos.clone(),
        mesh: termGroup,
      });
    });

    // Street Cyber Benches
    const benchCoords: [number, number, number][] = [
      [8, 10, 0],
      [-8, 10, 0],
      [8, -10, Math.PI],
      [-8, -10, Math.PI],
    ];

    benchCoords.forEach(([bx, bz, rotY], i) => {
      const bench = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.45, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x1b2838, roughness: 0.5, metalness: 0.6 })
      );
      bench.position.set(bx, 0.22, bz);
      bench.rotation.y = rotY;
      this.group.add(bench);

      this.collisionSystem.addBox(
        new THREE.Box3(
          new THREE.Vector3(bx - 1.2, 0, bz - 0.4),
          new THREE.Vector3(bx + 1.2, 0.8, bz + 0.4)
        ),
        `bench_${i}`
      );
    });
  }

  // 5. Perimeter Boundaries to keep player inside district
  private createPerimeterBoundaries() {
    const boundSize = 68;
    const fenceMat = new THREE.MeshStandardMaterial({
      color: 0x0b1320,
      roughness: 0.6,
      metalness: 0.8,
    });
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.7,
    });

    const walls: [number, number, number, number][] = [
      [0, -boundSize, boundSize * 2, 2], // North
      [0, boundSize, boundSize * 2, 2],  // South
      [-boundSize, 0, 2, boundSize * 2], // West
      [boundSize, 0, 2, boundSize * 2],  // East
    ];

    walls.forEach(([wx, wz, ww, wd], i) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(ww, 4, wd), fenceMat);
      wall.position.set(wx, 2, wz);
      this.group.add(wall);

      // Glowing laser line atop fence
      const laser = new THREE.Mesh(
        new THREE.BoxGeometry(ww > wd ? ww : 0.2, 0.1, wd > ww ? wd : 0.2),
        laserMat
      );
      laser.position.set(wx, 3.8, wz);
      this.group.add(laser);

      this.collisionSystem.addBox(
        new THREE.Box3(
          new THREE.Vector3(wx - ww / 2, 0, wz - wd / 2),
          new THREE.Vector3(wx + ww / 2, 6, wz + wd / 2)
        ),
        `perimeter_${i}`
      );
    });
  }

  // Animate dynamic elements (obelisk rotation, neon pulses)
  public update(delta: number, elapsed: number) {
    if (this.obeliskMesh) {
      this.obeliskMesh.rotation.y += delta * 0.8;
      this.obeliskMesh.position.y = 3.6 + Math.sin(elapsed * 2.0) * 0.15;
    }

    // Subtle neon flicker/pulse
    const pulseFactor = 0.95 + Math.sin(elapsed * 4.0) * 0.05;
    for (let i = 0; i < this.neonLights.length; i++) {
      this.neonLights[i].intensity = (i % 2 === 0 ? 2.0 : 1.5) * pulseFactor;
    }
  }
}
