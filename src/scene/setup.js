import * as THREE from 'three'

export function createSetup() {
  const scene = new THREE.Scene()

  const fogColor = '#d6e4f0'
  scene.fog = new THREE.FogExp2(fogColor, 0.014)
  scene.background = new THREE.Color(fogColor)

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  )
  camera.position.set(0, 6, 2)
  camera.lookAt(0, 1, -15)

  const canvas = document.querySelector('canvas.webgl')
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.LinearToneMapping
  renderer.toneMappingExposure = 1.0

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  return { scene, camera, renderer }
}
