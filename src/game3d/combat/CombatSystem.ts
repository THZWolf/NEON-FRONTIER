import * as THREE from 'three';
import { gameAudio } from '../core/Audio';

export interface WeaponData {
  id: string;
  name: string;
  type: 'MELEE' | 'RIFLE' | 'HEAVY';
  magCapacity: number;
  currentMag: number;
  reserveAmmo: number;
  damage: number;
  fireRate: number; // shots per sec
  range: number;
  icon: string;
}

export class CombatSystem {
  public weapons: WeaponData[] = [
    {
      id: 'unarmed',
      name: 'Cyber-Fist (Melee)',
      type: 'MELEE',
      magCapacity: 0,
      currentMag: 0,
      reserveAmmo: 0,
      damage: 25,
      fireRate: 2,
      range: 2.5,
      icon: 'fist',
    },
    {
      id: 'arc_rifle',
      name: 'Arc-Rifle NF-7',
      type: 'RIFLE',
      magCapacity: 30,
      currentMag: 30,
      reserveAmmo: 180,
      damage: 42,
      fireRate: 8,
      range: 85,
      icon: 'rifle',
    },
    {
      id: 'viper_cannon',
      name: 'Viper Plasma Cannon',
      type: 'HEAVY',
      magCapacity: 6,
      currentMag: 6,
      reserveAmmo: 36,
      damage: 120,
      fireRate: 1.5,
      range: 110,
      icon: 'heavy',
    },
  ];

  public activeWeaponIndex = 1; // Start with Arc-Rifle NF-7
  public isAiming = false;
  public health = 100;
  public maxHealth = 100;
  public armor = 75;
  public maxArmor = 100;

  // Wanted Level (0 to 5 Stars)
  public wantedStars = 0;
  public wantedCooldownTimer = 0;
  private lastFireTime = 0;

  // Visual effects: laser tracers and hit sparks
  private tracersGroup = new THREE.Group();
  private muzzleLight: THREE.PointLight;
  private muzzleFlashTimer = 0;

  constructor(private scene: THREE.Scene, private camera: THREE.PerspectiveCamera) {
    this.scene.add(this.tracersGroup);

    this.muzzleLight = new THREE.PointLight(0x00f2fe, 0, 6);
    this.scene.add(this.muzzleLight);
  }

  public get activeWeapon(): WeaponData {
    return this.weapons[this.activeWeaponIndex];
  }

  public selectWeapon(index: number) {
    if (index >= 0 && index < this.weapons.length) {
      this.activeWeaponIndex = index;
      gameAudio.playInteract();
    }
  }

  public setAiming(aiming: boolean) {
    this.isAiming = aiming;
  }

  // Shoot weapon along camera forward vector
  public shoot(origin: THREE.Vector3, targetPoint: THREE.Vector3): boolean {
    const weapon = this.activeWeapon;
    const now = performance.now() / 1000;
    const minInterval = 1 / weapon.fireRate;

    if (now - this.lastFireTime < minInterval) {
      return false;
    }

    if (weapon.type !== 'MELEE') {
      if (weapon.currentMag <= 0) {
        this.reload();
        return false;
      }
      weapon.currentMag--;
    }

    this.lastFireTime = now;

    // Audio
    const isHeavy = weapon.type === 'HEAVY';
    gameAudio.playLaserShot(isHeavy);

    // Muzzle Flash
    this.muzzleLight.color.setHex(isHeavy ? 0xff4400 : 0x00f2fe);
    this.muzzleLight.position.copy(origin);
    this.muzzleLight.intensity = 4.0;
    this.muzzleFlashTimer = 0.08;

    // Create 3D Laser Tracer Beam
    this.spawnLaserTracer(origin, targetPoint, isHeavy);

    // Audio impact on wall/ground
    setTimeout(() => {
      gameAudio.playImpactSound();
    }, 40);

    // Shooting weapon in public raises wanted level
    this.addCrimeHeat(1);

    return true;
  }

  public reload() {
    const weapon = this.activeWeapon;
    if (weapon.type === 'MELEE') return;
    if (weapon.currentMag === weapon.magCapacity || weapon.reserveAmmo <= 0) return;

    const needed = weapon.magCapacity - weapon.currentMag;
    const available = Math.min(needed, weapon.reserveAmmo);
    weapon.currentMag += available;
    weapon.reserveAmmo -= available;
    gameAudio.playVehicleDoor(true);
  }

  // Raise wanted stars upon committing crimes
  public addCrimeHeat(stars: number) {
    const oldStars = this.wantedStars;
    this.wantedStars = Math.min(5, this.wantedStars + stars);
    this.wantedCooldownTimer = 18.0; // 18 seconds to evade police

    if (this.wantedStars > oldStars) {
      gameAudio.playWantedLevelUp();
    }

    if (this.wantedStars >= 3) {
      gameAudio.setPoliceSiren(true);
    }
  }

  public clearWantedLevel() {
    this.wantedStars = 0;
    this.wantedCooldownTimer = 0;
    gameAudio.setPoliceSiren(false);
  }

  public takeDamage(amount: number) {
    if (this.armor > 0) {
      const absorbed = Math.min(this.armor, amount * 0.7);
      this.armor -= absorbed;
      this.health -= amount - absorbed;
    } else {
      this.health -= amount;
    }
    this.health = Math.max(0, this.health);
    gameAudio.playLand();
  }

  public heal(amount: number, armorAmount: number = 0) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.armor = Math.min(this.maxArmor, this.armor + armorAmount);
  }

  private spawnLaserTracer(from: THREE.Vector3, to: THREE.Vector3, isHeavy: boolean) {
    const dir = to.clone().sub(from);
    const length = dir.length();
    const mid = from.clone().add(dir.clone().multiplyScalar(0.5));

    const geometry = new THREE.CylinderGeometry(
      isHeavy ? 0.08 : 0.03,
      isHeavy ? 0.08 : 0.03,
      length,
      8
    );
    const material = new THREE.MeshBasicMaterial({
      color: isHeavy ? 0xff4400 : 0x00f2fe,
      transparent: true,
      opacity: 0.9,
    });

    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.copy(mid);
    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());

    this.tracersGroup.add(cylinder);

    // Fade out and remove
    setTimeout(() => {
      this.tracersGroup.remove(cylinder);
      geometry.dispose();
      material.dispose();
    }, 70);
  }

  public update(delta: number) {
    // Muzzle flash decay
    if (this.muzzleFlashTimer > 0) {
      this.muzzleFlashTimer -= delta;
      if (this.muzzleFlashTimer <= 0) {
        this.muzzleLight.intensity = 0;
      }
    }

    // Wanted Cooldown
    if (this.wantedStars > 0) {
      this.wantedCooldownTimer -= delta;
      if (this.wantedCooldownTimer <= 0) {
        this.wantedStars = Math.max(0, this.wantedStars - 1);
        this.wantedCooldownTimer = 12.0;
        if (this.wantedStars < 3) {
          gameAudio.setPoliceSiren(false);
        }
      }
    }
  }

  public dispose() {
    this.scene.remove(this.tracersGroup);
    this.scene.remove(this.muzzleLight);
    gameAudio.setPoliceSiren(false);
  }
}
