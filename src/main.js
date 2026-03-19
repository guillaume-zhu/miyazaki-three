import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import GUI, { Controller } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector("canvas.webgl")
console.log(canvas)

// Scene
const scene = new THREE.Scene()

// Helpers
const grid = new THREE.GridHelper(10, 10)
scene.add(grid)

const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

/**
 * Models
 */

const gltfLoader = new GLTFLoader()

gltfLoader.load(`models/Warawara.glb`, (gltf) => {
  console.log("Modèle chargé !", gltf)
  scene.add(gltf.scene)
})

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight("#ffffff", 5)
scene.add(ambientLight)

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1),
  new THREE.MeshBasicMaterial({ wireframe: true }),
)

scene.add(cube)
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
}

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor("#111111")

/**
 * Animate
 */
const timer = new THREE.Timer()

const tick = () => {
  const elapsedTIme = timer.getElapsed()

  timer.update()

  renderer.render(scene, camera)

  window.requestAnimationFrame(tick)
}
tick()
