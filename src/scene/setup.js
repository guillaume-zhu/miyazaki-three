import * as THREE from "three"

export function createSetup() {
  /*
   * Base
   */
  // Canvas
  const canvas = document.querySelector("canvas.webgl")

  // Scene
  const scene = new THREE.Scene()

  /**
   * Camera
   */
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500)
  camera.position.set(0, 4, -15)

  /**
   * Renderer
   */
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.LinearToneMapping
  renderer.toneMappingExposure = 1.0

  /**
   * Resize
   */
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  })

  return { scene, camera, renderer }
}
