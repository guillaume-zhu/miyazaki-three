import "./style.css"
import * as THREE from "three"
import Stats from "three/examples/jsm/libs/stats.module.js"

import { loadModels } from "./models/loadModels.js"

import { createSetup } from "./scene/setup.js"
import { loadPlatform } from "./world/platform.js"
import { createWater } from "./world/water.js"
import { createGrass } from "./world/grass.js"
import { createSky } from "./world/sky.js"
import { createLights } from "./scene/lights.js"

import { CameraControls } from "./controls/CameraControls.js"
import { MouseTracker } from "./controls/MouseTracker.js"

import { loadInteractiveModel } from "./utils/loadInteractiveModel.js"
import { updateHoverState } from "./utils/updateHoverState.js"
import { registerInteractiveModel } from "./utils/registerInteractiveModel.js"
import { getModelFromIntersectedObject } from "./utils/getModelFromIntersectedObject.js"
import { setupModelAnimation } from "./utils/setupModelAnimation.js"

/**
 * Global state
 */
// Camera
let cameraControls = null

// Raycaster
const raycaster = new THREE.Raycaster()
const interactiveObjects = []
let currentIntersect = null
let hoveredModel = null
const mixers = []

/**
 * Helper
 */

/**
 * User interactions
 */
window.addEventListener("click", () => {
  if (cameraControls?.hasMoved) {
    return
  }

  const clickedModel = currentIntersect
    ? getModelFromIntersectedObject(currentIntersect.object)
    : null

  if (clickedModel) {
    console.log("Objet cliqué :", clickedModel)
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
   * Renderer and stat info panel
   */
  const stats = new Stats()
  stats.showPanel(0)
  document.body.appendChild(stats.dom)

  stats.dom.style.position = "fixed"
  stats.dom.style.top = "0px"
  stats.dom.style.left = "0px"
  stats.dom.style.zIndex = "999"

  const debugPanel = document.createElement("div")
  debugPanel.className = "debug-panel"
  document.body.appendChild(debugPanel)

  const gridHelper = new THREE.GridHelper(100, 100)
  scene.add(gridHelper)
  gridHelper.position.y = 0.5

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
   * Models import
   */
  const magicGoldMaterials = []
  const magicGoldModels = []

  loadModels({ scene, interactiveObjects, mixers, magicGoldMaterials, magicGoldModels })

  /**
   * Animation loop
   */
  const timer = new THREE.Timer()

  function animate() {
    requestAnimationFrame(animate)

    stats.begin()

    // ---- Time update ---- //
    timer.update()
    const delta = timer.getDelta()
    const t = timer.getElapsed()

    // ---- World Animation update---- //
    grassMaterial.uniforms.uTime.value = t
    waterMaterial.uniforms.uTime.value = t

    // ---- Play animation ---- //
    for (const mixer of mixers) {
      mixer.update(delta)
    }

    // Gold Animation
    for (const material of magicGoldMaterials) {
      if ("emissiveIntensity" in material) {
        material.emissiveIntensity = 2.5 + Math.sin(t * 4) * 0.4
      }
    }

    for (const model of magicGoldModels) {
      model.position.y = model.userData.baseY + Math.sin(t * 2) * 0.08
      model.rotation.y += 0.01
    }

    // ---- Raycaster update ---- //
    raycaster.setFromCamera(mouseTracker.coords, camera)
    const intersects = raycaster.intersectObjects(interactiveObjects, false)
    let newHoveredModel = null

    if (intersects.length) {
      currentIntersect = intersects[0]
      newHoveredModel = getModelFromIntersectedObject(currentIntersect.object)

      renderer.domElement.style.cursor = newHoveredModel ? "pointer" : "default"
    } else {
      currentIntersect = null
      renderer.domElement.style.cursor = "default"
    }

    hoveredModel = updateHoverState(hoveredModel, newHoveredModel)

    // ---- Render ---- //
    renderer.render(scene, camera)

    debugPanel.innerHTML = `
  Triangles: ${renderer.info.render.triangles}<br>
  Draw calls: ${renderer.info.render.calls}<br>
  Geometries: ${renderer.info.memory.geometries}<br>
  Textures: ${renderer.info.memory.textures}
`

    stats.end()
  }

  animate()
}

init()
