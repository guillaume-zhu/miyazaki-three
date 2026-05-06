import * as THREE from "three"

export function createLights(scene) {
  const hemi = new THREE.HemisphereLight("#e87c4e", "#6f8f4e", 0.85)
  scene.add(hemi)

  const sun = new THREE.DirectionalLight("#fff1d0", 0.8)
  sun.position.set(-20, 30, 10)
  sun.target.position.set(0, 2, -25)
  scene.add(sun)
  scene.add(sun.target)

  const fill = new THREE.DirectionalLight("#fff1d0", 0.45)
  fill.position.set(0, 8, -5)
  fill.target.position.set(0, 2, -30)
  scene.add(fill)
  scene.add(fill.target)

  const sunHelper = new THREE.DirectionalLightHelper(sun, 5)
  const fillHelper = new THREE.DirectionalLightHelper(fill, 3)

  // scene.add(sunHelper)
  // scene.add(fillHelper)

  return { hemi, sun, fill, sunHelper, fillHelper }
}
