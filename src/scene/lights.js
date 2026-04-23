import * as THREE from "three"

export function createLights(scene) {
  const ambient = new THREE.AmbientLight("#b4c6e0", 8)
  scene.add(ambient)

  const sun = new THREE.DirectionalLight("#fff4e0", 0.6)
  sun.position.set(-10, 15, 10)
  sun.castShadow = false
  scene.add(sun)

  const fill = new THREE.DirectionalLight("#c4d7f2", 0.3)
  fill.position.set(5, 3, -5)
  scene.add(fill)

  const hemi = new THREE.HemisphereLight("#87CEEB", "#5B7744", 0.25)
  scene.add(hemi)

  return { ambient, sun, fill, hemi }
}
