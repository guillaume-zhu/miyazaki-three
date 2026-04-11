import * as THREE from 'three'

export function createFog(scene) {
    scene.fog = new THREE.FogExp2('#c8dbbe', 0.018)
    scene.background = new THREE.Color('#c8dbbe')
}
