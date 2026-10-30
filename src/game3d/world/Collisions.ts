import * as THREE from 'three';

export interface CollisionBox {
  min: THREE.Vector3;
  max: THREE.Vector3;
  id?: string;
}

export class CollisionSystem {
  public obstacles: CollisionBox[] = [];

  public clear() {
    this.obstacles = [];
  }

  public addBox(box: THREE.Box3, id?: string) {
    this.obstacles.push({
      min: box.min.clone(),
      max: box.max.clone(),
      id,
    });
  }

  // Check if a sphere at point (x, y, z) with radius collides with any AABB
  public checkSphere(pos: THREE.Vector3, radius: number): boolean {
    for (let i = 0; i < this.obstacles.length; i++) {
      const box = this.obstacles[i];

      // Check if vertical overlaps
      if (pos.y + radius < box.min.y || pos.y > box.max.y) {
        continue;
      }

      // Find closest point on AABB to sphere center
      const closestX = Math.max(box.min.x, Math.min(pos.x, box.max.x));
      const closestZ = Math.max(box.min.z, Math.min(pos.z, box.max.z));

      const dx = pos.x - closestX;
      const dz = pos.z - closestZ;
      const distSq = dx * dx + dz * dz;

      if (distSq < radius * radius) {
        return true;
      }
    }
    return false;
  }

  // Smooth sliding collision resolution for player movement
  public resolveMovement(oldPos: THREE.Vector3, newPos: THREE.Vector3, radius: number): THREE.Vector3 {
    const resolved = newPos.clone();

    // Try moving along X first
    const testPosX = new THREE.Vector3(newPos.x, oldPos.y, oldPos.z);
    if (this.checkSphere(testPosX, radius)) {
      resolved.x = oldPos.x;
    }

    // Try moving along Z
    const testPosZ = new THREE.Vector3(resolved.x, oldPos.y, newPos.z);
    if (this.checkSphere(testPosZ, radius)) {
      resolved.z = oldPos.z;
    }

    // Final safety check: if still colliding, revert to old position
    if (this.checkSphere(resolved, radius)) {
      return oldPos.clone();
    }

    return resolved;
  }
}
