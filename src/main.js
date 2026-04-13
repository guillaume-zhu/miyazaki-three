import * as THREE from "three"
import { CameraControls } from "./controls/CameraControls.js"
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
 * Mouse and Click event
 */
const mouse = new THREE.Vector2()

// Mousemove
canvas.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1
  mouse.y = -(event.clientY / sizes.height) * 2 + 1
})

// Click
window.addEventListener("click", () => {
  if (cameraControls && cameraControls.hasMoved) return

  if (currentIntersect) {
    console.log("Objet cliqué :", currentIntersect.object)
  }
})

/**
 * Raycaster
 */

// Setup
const raycaster = new THREE.Raycaster()

// Interactive objects pour raycaster
const interactiveObjects = []

// CurrentIntersect pour stocker les objets qui sont en hover
let currentIntersect = null

/**
 * Models Imports
 */

// Warawara
const gltfLoader = new GLTFLoader()

gltfLoader.load("models/Warawara.glb", (gltf) => {
  console.log("warawara chargé", gltf)

  const model = gltf.scene

  // Ajout dans la scène
  scene.add(model)

  // Ajout dans interactiveObjects
  interactiveObjects.push(model)
})

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight("#ffffff", 5)
scene.add(ambientLight)

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1),
  new THREE.MeshBasicMaterial({ color: "pink" }),
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

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 2, 8)
scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor("#111111")

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

// Controls
const cameraControls = new CameraControls(camera, scene, canvas)



/**
 * Animate
 */
const timer = new THREE.Timer()

const tick = () => {
  const elapsedTIme = timer.getElapsed()

  timer.update()

  // Update object
  cube.position.y = Math.sin(elapsedTIme * 0.8)

  // Raycaster
  raycaster.setFromCamera(mouse, camera)
  const objectToTest = [cube]
  const intersects = raycaster.intersectObjects(objectToTest)

  for (const object of objectToTest) {
    object.scale.setScalar(1)
  }
  for (const intersect of intersects) {
    intersect.object.scale.setScalar(1.2)
  }

  if (intersects.length) {
    currentIntersect = intersects[0]
  } else {
    currentIntersect = null
  }

  renderer.render(scene, camera)

  window.requestAnimationFrame(tick)
}
tick()
