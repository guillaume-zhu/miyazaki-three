import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export function loadMountain(scene) {
  const loader = new GLTFLoader()

  loader.load('/models/mountain.glb', (gltf) => {
    const mountain = gltf.scene

    mountain.position.set(50, -3, -100)
    mountain.scale.setScalar(1)
    mountain.rotation.y = -Math.PI / 1.5

    mountain.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    scene.add(mountain)
  })
}
