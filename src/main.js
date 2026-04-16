import "./style.css"
import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/Addons.js"
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js"

import { createSetup } from "./scene/setup.js"
import { loadPlatform } from "./world/platform.js"
import { createWater } from "./world/water.js"
import { createGrass } from "./world/grass.js"
import { createSky } from "./world/sky.js"
import { createLights } from "./scene/lights.js"

import { CameraControls } from "./controls/CameraControls.js"
import { MouseTracker } from "./controls/MouseTracker.js"

/**
 * Global state
 */
// Camera
let cameraControls = null

// Raycaster
const raycaster = new THREE.Raycaster()
const interactiveObjects = []
let currentIntersect = null

/**
 * User interactions
 */
window.addEventListener("click", () => {
  if (cameraControls?.hasMoved) {
    return
  }
  if (currentIntersect) {
    console.log("Objet cliqué :", currentIntersect.object)
  }
})

/**
 * App Initialization
 */
async function init() {
  /**
   * Scene setup
   */
  const { scene, camera, renderer } = createSetup()

  /**
   * Camera controls
   */
  const mouseTracker = new MouseTracker(renderer.domElement)
  cameraControls = new CameraControls(camera, scene, mouseTracker)

  /**
   * Environment
   */
  createLights(scene)
  createSky(scene)

  /**
   * World elements
   */
  const platform = await loadPlatform(scene)
  const grassMaterial = createGrass(scene, platform)
  const waterMaterial = createWater(scene)

  /**
   * Models
   */
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath("/draco/")

  const gltfLoader = new GLTFLoader()
  gltfLoader.setDRACOLoader(dracoLoader)
  gltfLoader.setMeshoptDecoder(MeshoptDecoder)

  // Warawara
  gltfLoader.load("models/Warawara.glb", (gltf) => {
    console.log("warawara chargé", gltf)

    const model = gltf.scene
    scene.add(model)

    model.position.z = -10
    model.position.y = 5

    // Ajout dans interactiveObjects
    interactiveObjects.push(model)
  })

  /**
   * Animation loop
   */
  const timer = new THREE.Timer()

  function animate() {
    requestAnimationFrame(animate)

    // ---- Time update ---- //
    timer.update()
    const t = timer.getElapsed()

    // ---- World Animation update---- //
    grassMaterial.uniforms.uTime.value = t
    waterMaterial.uniforms.uTime.value = t

    // ---- Raycaster update ---- //
    raycaster.setFromCamera(mouseTracker.coords, camera)
    const intersects = raycaster.intersectObjects(interactiveObjects, true)

    for (const object of interactiveObjects) {
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

    // ---- Render ---- //
    renderer.render(scene, camera)
  }

  animate()
}

init()
