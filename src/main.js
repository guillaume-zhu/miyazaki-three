import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import GUI, { Controller } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/Addons.js"
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js"

import { createBoxHitbox } from "./utils/createBoxHitbox"
import { createGlobalHull } from "./utils/createGlobalHull"
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
const grid = new THREE.GridHelper(100, 100)
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
const mixers = []

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath("/draco/")

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.setMeshoptDecoder(MeshoptDecoder)

// ---- avion Animated ---- //
gltfLoader.load("models/avion.glb", (gltf) => {
  console.log("avion chargé", gltf)

  const model = gltf.scene
  model.position.set(5, 2, -8)

  scene.add(model)

  // ---- Animation ---- //
  if (gltf.animations.length > 0) {
    const mixer = new THREE.AnimationMixer(model)
    const action = mixer.clipAction(gltf.animations[0])

    action.play()
    mixers.push(mixer)

    model.userData.mixer = mixer
    model.userData.action = action
  }

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 1, 1, 1, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

// ---- adriano ---- //
gltfLoader.load("models/adriano.glb", (gltf) => {
  console.log("adriano chargé", gltf)

  const model = gltf.scene
  model.position.set(0, 0, -50)
  model.scale.setScalar(0.5)

  scene.add(model)

  // -- Création du contour -- //
  const outlineBaseThickness = 0.2
  const outlineHoverThickness = 0.3
  const outline = createGlobalHull(model, outlineBaseThickness)
  if (outline) {
    model.add(outline)
  }

  // Stockage mémoire du contour dans le model
  model.userData.outline = outline
  model.userData.outlineBaseThickness = outlineBaseThickness
  model.userData.outlineHoverThickness = outlineHoverThickness

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 0.7, 1, 0.3, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

// ---- balais-kiki ---- //
gltfLoader.load("models/balais-kiki.glb", (gltf) => {
  console.log("balais-kiki chargé", gltf)

  const model = gltf.scene
  model.scale.setScalar(0.07)
  model.position.x = -2
  model.position.z = -2

  scene.add(model)

  // -- Création du contour -- //
  const outlineBaseThickness = 0.2
  const outlineHoverThickness = 0.4
  const outline = createGlobalHull(model, outlineBaseThickness)
  if (outline) {
    model.add(outline)
  }

  // Stockage mémoire du contour dans le model
  model.userData.outline = outline
  model.userData.outlineBaseThickness = outlineBaseThickness
  model.userData.outlineHoverThickness = outlineHoverThickness

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 1, 1, 1, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

// ---- bateau-ponyo ---- //
gltfLoader.load("models/bateau-ponyo.glb", (gltf) => {
  console.log("bateau-ponyo chargé", gltf)

  const model = gltf.scene
  model.position.x = 0
  model.position.z = -30
  model.rotation.y = Math.PI * 1.5

  scene.add(model)

  // -- Création du contour -- //
  const outlineBaseThickness = 0.03
  const outlineHoverThickness = 0.05
  const outline = createGlobalHull(model, outlineBaseThickness)
  if (outline) {
    model.add(outline)
  }

  // Stockage mémoire du contour dans le model
  model.userData.outline = outline
  model.userData.outlineBaseThickness = outlineBaseThickness
  model.userData.outlineHoverThickness = outlineHoverThickness

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 1, 1, 1, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

// ---- calcifer Animated ---- //
gltfLoader.load("models/calcifer.glb", (gltf) => {
  console.log("calcifer chargé", gltf)

  const model = gltf.scene
  model.scale.setScalar(0.15)
  model.position.x = 4

  scene.add(model)

  // ---- Animation ---- //
  if (gltf.animations.length > 0) {
    const mixer = new THREE.AnimationMixer(model)
    const action = mixer.clipAction(gltf.animations[0])

    action.play()
    mixers.push(mixer)

    model.userData.mixer = mixer
    model.userData.action = action
  }

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 0.3, 0.5, 0.3, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

// ---- chateau-ambulant ---- //
gltfLoader.load("models/chateau-ambulant.glb", (gltf) => {
  console.log("chateau-ambulant chargé", gltf)

  const model = gltf.scene
  model.scale.setScalar(0.2)
  model.rotation.y = Math.PI * 0.5
  model.position.x = 18
  model.position.z = -50
  model.position.y = 3

  scene.add(model)

  // -- Création du contour -- //
  const outlineBaseThickness = 0.2
  const outlineHoverThickness = 0.4
  const outline = createGlobalHull(model, outlineBaseThickness)
  if (outline) {
    model.add(outline)
  }

  // Stockage mémoire du contour dans le model
  model.userData.outline = outline
  model.userData.outlineBaseThickness = outlineBaseThickness
  model.userData.outlineHoverThickness = outlineHoverThickness

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 1, 1, 1, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

// ---- chateau-laputa ---- //
gltfLoader.load("models/chateau-laputa.glb", (gltf) => {
  console.log("chateau-laputa chargé", gltf)

  const model = gltf.scene
  model.scale.setScalar(1.5)

  model.position.x = 15
  model.position.z = -50
  model.position.y = 10

  scene.add(model)

  // -- Création du contour -- //
  const outlineBaseThickness = 0.03
  const outlineHoverThickness = 0.06
  const outline = createGlobalHull(model, outlineBaseThickness)
  if (outline) {
    model.add(outline)
  }

  // Stockage mémoire du contour dans le model
  model.userData.outline = outline
  model.userData.outlineBaseThickness = outlineBaseThickness
  model.userData.outlineHoverThickness = outlineHoverThickness

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 1, 1, 1, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

// ---- chapeau-paille ---- //
gltfLoader.load("models/chapeau-paille.glb", (gltf) => {
  console.log("chapeau-paille chargé", gltf)

  const model = gltf.scene
  model.scale.setScalar(0.08)
  model.position.set(-1, 0, 1)

  model.traverse((child) => {
    if (!child.isMesh || !child.material) return

    const materials = Array.isArray(child.material) ? child.material : [child.material]

    materials.forEach((mat) => {
      if (mat.map) {
        mat.emissiveMap = mat.map
        mat.emissive.set(0xffffff)
        mat.emissiveIntensity = 1.5
      }

      if ("aoMapIntensity" in mat) {
        mat.aoMapIntensity = 0
      }

      mat.needsUpdate = true
    })
  })

  scene.add(model)

  // -- Création du contour -- //
  const outlineBaseThickness = 0.2
  const outlineHoverThickness = 0.4
  const outline = createGlobalHull(model, outlineBaseThickness)
  if (outline) {
    model.add(outline)
  }

  // Stockage mémoire du contour dans le model
  model.userData.outline = outline
  model.userData.outlineBaseThickness = outlineBaseThickness
  model.userData.outlineHoverThickness = outlineHoverThickness

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 1, 1, 1, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

// ---- Chihiro Animated ---- //
gltfLoader.load("models/chihiro.glb", (gltf) => {
  console.log("chihiro chargé", gltf)

  const model = gltf.scene
  model.scale.setScalar(0.14)
  model.position.x = 8
  model.position.z = -5
  model.rotation.y = Math.PI * 1.5

  scene.add(model)

  // ---- Animation ---- //
  if (gltf.animations.length > 0) {
    const mixer = new THREE.AnimationMixer(model)
    const action = mixer.clipAction(gltf.animations[0])

    action.play()
    mixers.push(mixer)

    model.userData.mixer = mixer
    model.userData.action = action
  }

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 0.3, 1, 1, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

// ---- canne ---- //
gltfLoader.load("models/canne.glb", (gltf) => {
  console.log("canne chargé", gltf)

  const model = gltf.scene
  model.position.x = 5
  model.position.y = 2
  model.position.z = -4

  scene.add(model)

  // -- Création du contour -- //
  const outlineBaseThickness = 0.01
  const outlineHoverThickness = 0.02
  const outline = createGlobalHull(model, outlineBaseThickness)
  if (outline) {
    model.add(outline)
  }

  // Stockage mémoire du contour dans le model
  model.userData.outline = outline
  model.userData.outlineBaseThickness = outlineBaseThickness
  model.userData.outlineHoverThickness = outlineHoverThickness

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 1, 1, 1, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

// ---- couteau ---- //
gltfLoader.load("models/couteau.glb", (gltf) => {
  console.log("couteau chargé", gltf)

  const model = gltf.scene
  model.scale.setScalar(0.0008)
  model.rotation.z = Math.PI * -0.75
  model.position.set(-6, 3, 0)

  scene.add(model)

  // -- Création du contour -- //
  const outlineBaseThickness = 20
  const outlineHoverThickness = 40
  const outline = createGlobalHull(model, outlineBaseThickness)
  if (outline) {
    model.add(outline)
  }

  // Stockage mémoire du contour dans le model
  model.userData.outline = outline
  model.userData.outlineBaseThickness = outlineBaseThickness
  model.userData.outlineHoverThickness = outlineHoverThickness

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 1, 1, 1, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

// ---- epouvantail ---- //
gltfLoader.load("models/epouvantail.glb", (gltf) => {
  console.log("epouvantail chargé", gltf)

  const model = gltf.scene
  model.scale.setScalar(0.5)
  model.position.x = 10
  model.position.z = -50

  scene.add(model)

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 0.8, 1, 1, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

// ---- fleche ---- //
gltfLoader.load("models/fleche.glb", (gltf) => {
  console.log("fleche chargé", gltf)

  const model = gltf.scene
  model.position.x = 4
  model.position.y = 0
  model.position.z = -4
  model.rotation.z = Math.PI * 0.5
  model.rotation.x = Math.PI * 0.5

  scene.add(model)

  // -- Création du contour -- //
  const outlineBaseThickness = 0.01
  const outlineHoverThickness = 0.015
  const outline = createGlobalHull(model, outlineBaseThickness)
  if (outline) {
    model.add(outline)
  }

  // Stockage mémoire du contour dans le model
  model.userData.outline = outline
  model.userData.outlineBaseThickness = outlineBaseThickness
  model.userData.outlineHoverThickness = outlineHoverThickness

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 1, 1, 1, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

// ---- kiki ---- //
gltfLoader.load("models/kiki.glb", (gltf) => {
  console.log("kiki chargé", gltf)

  const model = gltf.scene
  model.scale.setScalar(1.05)
  model.position.set(-5, 0, -5)
  model.rotation.y = Math.PI
  scene.add(model)

  // -- Création du contour -- //
  const outlineBaseThickness = 0.01
  const outlineHoverThickness = 0.015
  const outline = createGlobalHull(model, outlineBaseThickness)
  if (outline) {
    model.add(outline)
  }

  // Stockage mémoire du contour dans le model
  model.userData.outline = outline
  model.userData.outlineBaseThickness = outlineBaseThickness
  model.userData.outlineHoverThickness = outlineHoverThickness

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 1, 1, 1, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

// ---- kodama ---- //
gltfLoader.load("models/kodama.glb", (gltf) => {
  console.log("kodama chargé", gltf)

  const model = gltf.scene
  model.scale.setScalar(0.02)
  model.position.set(-6, 0, -5)
  model.rotation.y = -Math.PI * 0.5

  scene.add(model)

  // -- Création du contour -- //
  const outlineBaseThickness = 0.5
  const outlineHoverThickness = 1
  const outline = createGlobalHull(model, outlineBaseThickness)
  if (outline) {
    model.add(outline)
  }

  // Stockage mémoire du contour dans le model
  model.userData.outline = outline
  model.userData.outlineBaseThickness = outlineBaseThickness
  model.userData.outlineHoverThickness = outlineHoverThickness

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 0.5, 1, 1, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

// ---- lanterne ---- //
gltfLoader.load("models/lanterne.glb", (gltf) => {
  console.log("lanterne chargé", gltf)

  const model = gltf.scene
  model.scale.setScalar(2)
  model.position.set(-7, 0, -4)
  model.rotation.y = Math.PI * 0.5

  scene.add(model)

  // -- Création du contour -- //
  const outlineBaseThickness = 0.005
  const outlineHoverThickness = 0.01
  const outline = createGlobalHull(model, outlineBaseThickness)
  if (outline) {
    model.add(outline)
  }

  // Stockage mémoire du contour dans le model
  model.userData.outline = outline
  model.userData.outlineBaseThickness = outlineBaseThickness
  model.userData.outlineHoverThickness = outlineHoverThickness

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 1, 1, 1, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

// ---- masque-sans-visage ---- //
gltfLoader.load("models/masque-sans-visage.glb", (gltf) => {
  console.log("masque-sans-visage chargé", gltf)

  const model = gltf.scene
  model.scale.setScalar(1.8)
  model.rotation.y = Math.PI * -0.5
  model.position.set(-3, 1, -3)

  scene.add(model)

  // -- Création du contour -- //
  const outlineBaseThickness = 0.015
  const outlineHoverThickness = 0.03
  const outline = createGlobalHull(model, outlineBaseThickness)
  if (outline) {
    model.add(outline)
  }

  // Stockage mémoire du contour dans le model
  model.userData.outline = outline
  model.userData.outlineBaseThickness = outlineBaseThickness
  model.userData.outlineHoverThickness = outlineHoverThickness

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 1, 1, 1, true)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
})

// ---- masque-mononoke ---- //
gltfLoader.load("models/masque-mononoke.glb", (gltf) => {
  console.log("masque-mononoke chargé", gltf)

  const model = gltf.scene
  model.scale.setScalar(0.25)
  model.rotation.x = Math.PI * -0.25
  model.position.set(1, 0.1, -0, 5)

  scene.add(model)

  // -- Création du contour -- //
  const outlineBaseThickness = 0.05
  const outlineHoverThickness = 0.1
  const outline = createGlobalHull(model, outlineBaseThickness)
  if (outline) {
    model.add(outline)
  }

  // Stockage mémoire du contour dans le model
  model.userData.outline = outline
  model.userData.outlineBaseThickness = outlineBaseThickness
  model.userData.outlineHoverThickness = outlineHoverThickness

  // -- Création de la hitbox -- //
  const hitbox = createBoxHitbox(model, 1, 1, 1, true)

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
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 500)
camera.position.set(0, 3, 11)
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
timer.connect(document)

const tick = () => {
  // ---- Clock ---- //
  timer.update()
  const delta = timer.getDelta()
  const elapsedTIme = timer.getElapsed()

  // ---- Animations ---- //
  for (const mixer of mixers) {
    mixer.update(delta)
  }

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
