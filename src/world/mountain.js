import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'

export function loadMountain(scene) {
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('/draco/')

  const loader = new GLTFLoader()
  loader.setDRACOLoader(dracoLoader)
  loader.setMeshoptDecoder(MeshoptDecoder)

  loader.load('/models/mountain.glb', (gltf) => {
    const mountain = gltf.scene

    mountain.position.set(50, -10, -100)
    mountain.scale.setScalar(0.1)
    mountain.rotation.y = -Math.PI / 1

    mountain.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    scene.add(mountain)
  })
}
