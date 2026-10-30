import * as THREE from 'three';
import { Vehicle, VehicleType } from './Vehicle';
import { CollisionSystem } from '../world/Collisions';
import { gameAudio } from '../core/Audio';

export class VehicleManager {
  public vehicles: Vehicle[] = [];
  public currentVehicle: Vehicle | null = null;
  public policeCruisers: Vehicle[] = [];

  constructor(
    private scene: THREE.Scene,
    private collisionSystem: CollisionSystem
  ) {
    this.spawnDefaultVehicles();
  }

  private spawnDefaultVehicles() {
    // 1. Player's Primary Cyber Supercar parked in Central Plaza
    const supercar = new Vehicle(
      'SUPERCAR',
      new THREE.Vector3(6, 0, 8),
      -Math.PI / 2,
      this.collisionSystem,
      {
        paintColor: 0x00f2fe, // Neon Cyan
        underglowColor: 0x00f2fe,
        turboLevel: 2,
      }
    );
    this.addVehicle(supercar);

    // 2. High-speed Sport Bike parked near Harbor Boulevard
    const bike = new Vehicle(
      'SPORTBIKE',
      new THREE.Vector3(-12, 0, 14),
      0,
      this.collisionSystem,
      {
        paintColor: 0xff0077, // Cyber Pink
        underglowColor: 0xff0077,
        turboLevel: 3,
      }
    );
    this.addVehicle(bike);

    // 3. Second Supercar parked near Auto-Mod Tuning Bay
    const customSupercar = new Vehicle(
      'SUPERCAR',
      new THREE.Vector3(24, 0, -18),
      Math.PI / 4,
      this.collisionSystem,
      {
        paintColor: 0xffaa00, // Sunset Amber
        underglowColor: 0xff0055,
        turboLevel: 3,
      }
    );
    this.addVehicle(customSupercar);
  }

  public addVehicle(vehicle: Vehicle) {
    this.vehicles.push(vehicle);
    this.scene.add(vehicle.mesh);
  }

  // Get closest vehicle within interaction distance
  public getClosestVehicle(pos: THREE.Vector3, maxDistance: number = 3.5): Vehicle | null {
    let closest: Vehicle | null = null;
    let minDistance = maxDistance;

    for (const v of this.vehicles) {
      const dist = v.position.distanceTo(pos);
      if (dist < minDistance) {
        minDistance = dist;
        closest = v;
      }
    }
    return closest;
  }

  public enterVehicle(vehicle: Vehicle) {
    this.currentVehicle = vehicle;
    vehicle.isOccupied = true;
    gameAudio.playVehicleDoor(true);
  }

  public exitVehicle(): THREE.Vector3 {
    if (!this.currentVehicle) return new THREE.Vector3();

    const exitVehicle = this.currentVehicle;
    exitVehicle.isOccupied = false;
    exitVehicle.speed = 0;
    gameAudio.stopEngineSound();
    gameAudio.playVehicleDoor(false);

    // Calculate exit position to the left of the driver door
    const exitAngle = exitVehicle.headingAngle + Math.PI / 2;
    const exitOffset = new THREE.Vector3(
      Math.sin(exitAngle) * 2.2,
      0,
      Math.cos(exitAngle) * 2.2
    );
    const exitPos = exitVehicle.position.clone().add(exitOffset);

    this.currentVehicle = null;
    return exitPos;
  }

  // Police Chase & Wanted System AI
  public updatePoliceCruisers(delta: number, playerPos: THREE.Vector3, wantedLevel: number) {
    const requiredPolice = wantedLevel >= 3 ? Math.min(wantedLevel - 1, 3) : 0;

    // Spawn or despawn cruisers to match wanted level
    while (this.policeCruisers.length < requiredPolice) {
      const angle = Math.random() * Math.PI * 2;
      const spawnPos = playerPos.clone().add(
        new THREE.Vector3(Math.cos(angle) * 45, 0, Math.sin(angle) * 45)
      );

      const copCar = new Vehicle(
        'POLICE_CRUISER',
        spawnPos,
        angle + Math.PI,
        this.collisionSystem
      );
      this.policeCruisers.push(copCar);
      this.addVehicle(copCar);
    }

    while (this.policeCruisers.length > requiredPolice) {
      const removed = this.policeCruisers.pop();
      if (removed) {
        this.scene.remove(removed.mesh);
        this.vehicles = this.vehicles.filter((v) => v !== removed);
      }
    }

    // AI pursuit logic for police cruisers
    for (const cruiser of this.policeCruisers) {
      const toPlayer = playerPos.clone().sub(cruiser.position);
      const dist = toPlayer.length();
      const targetAngle = Math.atan2(toPlayer.x, toPlayer.z);

      let angleDiff = targetAngle - cruiser.headingAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      const steer = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff) * 1.5, 1);
      const forward = dist > 6 ? 1 : 0.2;
      const brake = dist <= 6 && cruiser.speed > 5;

      cruiser.update(delta, {
        forward,
        steer,
        brake,
        nitro: dist > 25,
        horn: Math.random() < 0.01,
      });
    }
  }

  public update(
    delta: number,
    input: { forward: number; steer: number; brake: boolean; nitro: boolean; horn: boolean }
  ) {
    if (this.currentVehicle) {
      this.currentVehicle.update(delta, input);
    }
  }

  public dispose() {
    for (const v of this.vehicles) {
      this.scene.remove(v.mesh);
    }
    this.vehicles = [];
    this.policeCruisers = [];
  }
}
