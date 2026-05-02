import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";

export function createWater(scene) {
  scene.fog = new THREE.Fog("#ff8000", 800, 3000);

  const geometry = new THREE.CircleGeometry(4000, 64);
  const water = new Reflector(geometry, {
    textureWidth: 2048,
    textureHeight: 2048,
    clipBias: 0.003,
    color: new THREE.Color("#c2dadf"),
  });

  water.rotation.x = -Math.PI / 2;
  water.position.y = -3;
  scene.add(water);

  return {
    mesh: water,
    material: water.material,
  };
}