import * as THREE from 'three'

export function createSky(scene) {
  const skyGeo = new THREE.SphereGeometry(200, 32, 32)
  const loader = new THREE.TextureLoader()

  const skyTexture = loader.load('/textures/sky.png')
  skyTexture.colorSpace = THREE.SRGBColorSpace
  skyTexture.minFilter = THREE.LinearFilter
  skyTexture.magFilter = THREE.LinearFilter

  const skyMat = new THREE.MeshBasicMaterial({
    map: skyTexture,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  })

  const sky = new THREE.Mesh(skyGeo, skyMat)
  sky.rotation.y = Math.PI
  scene.add(sky)

  return sky
}
