import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export async function loadPlatform(scene) {
    const loader = new GLTFLoader()

    try {
        const gltf = await loader.loadAsync('/models/platform.glb')
        const platform = gltf.scene

        platform.position.set(0, 0, 0)

        platform.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
            color: '#5B7744',
            roughness: 0.95,
            metalness: 0.0,
            flatShading: true,
            })
        }
        })

        scene.add(platform)
        return platform

    } catch (err) {
        const geo = new THREE.CylinderGeometry(10, 10, 2, 32)
        const mat = new THREE.MeshStandardMaterial({
        color: '#5B7744',
        roughness: 0.95,
        flatShading: true,
        })
        const placeholder = new THREE.Mesh(geo, mat)
        placeholder.position.y = -1
        scene.add(placeholder)
        return placeholder
    }
}
