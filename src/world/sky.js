import * as THREE from 'three'

export function createSky(scene) {
    const loader = new THREE.CubeTextureLoader()

    const skyTexture = loader.load([
            '/textures/px.png',
            '/textures/nx.png',
            '/textures/py.png',
            '/textures/ny.png',
            '/textures/pz.png',
            '/textures/nz.png'
        ])


    skyTexture.colorSpace = THREE.SRGBColorSpace

    scene.background = skyTexture

    scene.environment = skyTexture 

    scene.backgroundRotation.y = -120

    scene.environmentRotation.y = -120

    return skyTexture 
}