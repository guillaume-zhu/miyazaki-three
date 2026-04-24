import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createSetup } from './scene/setup.js'
import { createControls } from './controls/camera.js'
import { loadPlatform } from './world/platform.js'
import { createWater } from './world/water.js'
import { createGrass } from './world/grass.js'
import { createSky } from './world/sky.js'
import { createLights } from './scene/lights.js'
import { loadMountain } from './world/mountain.js'

/**
 * Mouse and Click event
 */

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
})

window.addEventListener('click', () => {
  if (currentIntersect) {
    console.log('Objet cliqué :', currentIntersect.object)
  }
})

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// Interactive objects pour raycaster
const interactiveObjects = []

// CurrentIntersect pour stocker les objets qui sont en hover
let currentIntersect = null

async function init() {
  const { scene, camera, renderer } = createSetup()
  const controls = createControls(camera, renderer.domElement)

  createLights(scene)
  createSky(scene)

  const platform = await loadPlatform(scene)
  const grassMaterial = createGrass(scene, platform)
  const waterMaterial = createWater(scene)
  loadMountain(scene)

  /**
   * Models Imports
   */

  // Warawara
  const gltfLoader = new GLTFLoader()

  gltfLoader.load('models/Warawara.glb', (gltf) => {
    console.log('warawara chargé', gltf)

    const model = gltf.scene
    scene.add(model)

    // Ajout dans interactiveObjects
    interactiveObjects.push(model)
  })

  /**
   * Animate
   */
  const timer = new THREE.Timer()

  function animate() {
    requestAnimationFrame(animate)
    timer.update()
    const t = timer.getElapsed()

    grassMaterial.uniforms.uTime.value = t
    waterMaterial.uniforms.uTime.value = t

    // Raycaster
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(interactiveObjects)

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

    controls.update()
    renderer.render(scene, camera)
  }

  animate()
}

init()
