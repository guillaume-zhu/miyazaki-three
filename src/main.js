import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import GUI, { Controller } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

import { createGlobalHull } from "./utils/createGlobalHull"
import { createBoxHitbox } from "./utils/createBoxHitbox"
import { updateHoverState } from "./utils/updateHoverState"

/*
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

// Mousemove
const mouse = new THREE.Vector2()

canvas.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1
  mouse.y = -(event.clientY / sizes.height) * 2 + 1
})
// Click
window.addEventListener("click", () => {
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

// Stocker objet hovered
let hoveredModel = null

/**
 * Models Imports
 */
const gltfLoader = new GLTFLoader()

// ---- Warawara ---- //
gltfLoader.load("models/Warawara.glb", (gltf) => {
  console.log("warawara chargé", gltf)

  const model = gltf.scene

  // Ajout dans la scène
  scene.add(model)

  // -- Création du Hull -- //
  const hull = createGlobalHull(model, 0.025)
  if (hull) {
    model.add(hull)
  }

  // Stockage mémoire du hull dans le model
  model.userData.hull = hull

  // Paramétrage pour le contour en hover
  model.userData.hullBaseScale = 1.03
  model.userData.hullHoverScale = 1.06

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 1, 1, 0.7, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight("#ffffff", 5)
scene.add(ambientLight)

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
renderer.setClearColor("#757575")

/**
 * Animate
 */
const timer = new THREE.Timer()

const tick = () => {
  // ---- Clock ---- //
  const elapsedTIme = timer.getElapsed()

  timer.update()

  // ---- Raycaster ---- //
  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(interactiveObjects, false)
  let newHoveredModel = null

  // Si raycaster touche un objet
  if (intersects.length) {
    const hitObject = intersects[0].object
    newHoveredModel = hitObject.userData.model || null
    currentIntersect = intersects[0]

    canvas.style.cursor = "pointer"
  } else {
    currentIntersect = null

    canvas.style.cursor = "default"
  }
  // Si objet hover a changé depuis précédente frame
  hoveredModel = updateHoverState(hoveredModel, newHoveredModel)

  // ---- Render ---- //
  renderer.render(scene, camera)

  window.requestAnimationFrame(tick)
}
tick()
