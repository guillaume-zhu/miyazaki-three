import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/Addons.js"
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js"

import { loadInteractiveModel } from "../utils/loadInteractiveModel.js"

export const loadModels = ({
  scene,
  interactiveObjects,
  mixers,
  magicGoldMaterials,
  magicGoldModels,
}) => {
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath("/draco/")

  const gltfLoader = new GLTFLoader()
  gltfLoader.setDRACOLoader(dracoLoader)
  gltfLoader.setMeshoptDecoder(MeshoptDecoder)

  // ---- Avion ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/avion.glb",
    position: [25, 10, -100],
    rotation: [0, Math.PI * 1.5, 0],
    interactive: true,
    animated: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    onLoad: (model) => {
      model.userData.modelKey = "avion"
    },
  })

  // ---- Adriano ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/adriano.glb",
    position: [0, -3, -125],
    scale: 0.5,
    interactive: true,
    hitboxScale: [0.7, 1, 0.3],
    showHitbox: true,
    // outlineBaseThickness: 0.001,
    // outlineHoverThickness: 0.001,
    onLoad: (model) => {
      model.userData.modelKey = "adriano"
    },
  })

  // ---- Balais KIki ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/balais-kiki.glb",
    position: [-2, 8, -5],
    rotation: [0, Math.PI * 0.5, 0],
    scale: 0.07,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.01,
    outlineHoverThickness: 0.02,
    onLoad: (model) => {
      model.userData.modelKey = "balais-kiki"
    },
  })

  // ---- Bateau Ponyo ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/bateau-ponyo.glb",
    position: [0, -3, -90],
    rotation: [0, Math.PI * 0.5, 0],
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.03,
    outlineHoverThickness: 0.05,
    onLoad: (model) => {
      model.userData.modelKey = "bateau-ponyo"
    },
  })

  // ---- Chapeau de paille ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/chapeau-paille.glb",
    position: [-1, 1, -10],
    scale: 0.2,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.025,
    outlineHoverThickness: 0.05,
    onLoad: (model) => {
      model.userData.modelKey = "chapeau-paille"

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
    },
  })

  // ---- Calcifer ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/calcifer.glb",
    position: [20, 1, -15],
    scale: 0.3,
    interactive: true,
    animated: true,
    hitboxScale: [0.3, 0.5, 0.3],
    showHitbox: true,
    onLoad: (model) => {
      model.userData.modelKey = "calcifer"
    },
  })

  // ---- Chihiro ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/chihiro.glb",
    position: [8, 0, -10],
    rotation: [0, Math.PI * 1.5, 0],
    scale: 0.35,
    interactive: true,
    animated: true,
    hitboxScale: [0.3, 1, 1],
    showHitbox: true,
    onLoad: (model) => {
      model.userData.modelKey = "chihiro"
    },
  })

  // ---- Canne ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/canne.glb",
    position: [5, 2, -10],
    scale: 2,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.01,
    outlineHoverThickness: 0.02,
    onLoad: (model) => {
      model.userData.modelKey = "canne"
    },
  })

  // ---- Couteau ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/couteau.glb",
    position: [-10, 10, -10],
    rotation: [0, 0, Math.PI * -0.75],
    scale: 0.002,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    // outlineBaseThickness: 2,
    // outlineHoverThickness: 40000,
    onLoad: (model) => {
      model.userData.modelKey = "couteau"
    },
  })

  // ---- Epouvantail ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/epouvantail.glb",
    position: [10, 2, -100],
    scale: 0.5,
    interactive: true,
    hitboxScale: [0.8, 1, 1],
    showHitbox: true,
    onLoad: (model) => {
      model.userData.modelKey = "epouvantail"
    },
  })

  // ---- Fleche ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/fleche.glb",
    position: [15, 3, -15],
    scale: 1,
    rotation: [Math.PI * 0.5, 0, Math.PI * 0.5],
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.01,
    outlineHoverThickness: 0.015,
    onLoad: (model) => {
      model.userData.modelKey = "fleche"
    },
  })

  // ---- Kiki ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/kiki.glb",
    position: [-5, 0, -10],
    rotation: [0, Math.PI, 0],
    scale: 2.75,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.01,
    outlineHoverThickness: 0.015,
    onLoad: (model) => {
      model.userData.modelKey = "kiki"
    },
  })

  // ---- Kodama ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/kodama.glb",
    position: [-7, 0, -10],
    rotation: [0, -Math.PI * 0.5, 0],
    scale: 0.05,
    interactive: true,
    hitboxScale: [0.5, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.025,
    outlineHoverThickness: 0.05,
    onLoad: (model) => {
      model.userData.modelKey = "kodama"
    },
  })

  // ---- Lanterne ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/lanterne.glb",
    position: [-9, 0, -10],
    rotation: [0, Math.PI * 0.5, 0],
    scale: 5,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.005,
    outlineHoverThickness: 0.01,
    onLoad: (model) => {
      model.userData.modelKey = "lanterne"
    },
  })

  // ---- Masque Sans Visage ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/masque-sans-visage.glb",
    position: [-3, 1, -10],
    rotation: [0, Math.PI * -0.5, 0],
    scale: 1.8,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.015,
    outlineHoverThickness: 0.03,
    onLoad: (model) => {
      model.userData.modelKey = "masque-sans-visage"
    },
  })

  // ---- Masque Mononoke ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/masque-mononoke.glb",
    position: [1, 1, -10],
    rotation: [Math.PI * -0.25, 0, 0],
    scale: 0.5,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.025,
    outlineHoverThickness: 0.05,
    onLoad: (model) => {
      model.userData.modelKey = "masque-mononoke"
    },
  })

  // ---- Noiraude ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/noiraude.glb",
    position: [10, 1, -15],
    rotation: [0, 0, 0],
    scale: 1,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.025,
    outlineHoverThickness: 0.05,
    onLoad: (model) => {
      model.userData.modelKey = "noiraude"
    },
  })

  // ---- haku-queue ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/haku-queue.glb",
    position: [-10, 5, -20],
    rotation: [0, Math.PI * 0.5, 0],
    scale: 10,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.005,
    outlineHoverThickness: 0.01,
    onLoad: (model) => {
      model.userData.modelKey = "haku-queue"
    },
  })

  // ---- pepite-or ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/pepite-or.glb",
    position: [4, 5, -10],
    rotation: [0, Math.PI * 0.5, 0],
    scale: 0.05,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.02,
    outlineHoverThickness: 0.04,
    onLoad: (model) => {
      model.userData.modelKey = "pepite-or"
      model.userData.baseY = model.position.y
      magicGoldModels.push(model)

      model.traverse((child) => {
        if (!child.isMesh || !child.material) return

        child.material = child.material.clone()

        if ("emissive" in child.material) {
          child.material.emissive.set("#a88600")
          child.material.emissiveIntensity = 2.5
        }

        if ("metalness" in child.material) {
          child.material.metalness = 0.9
        }

        if ("roughness" in child.material) {
          child.material.roughness = 0.2
        }

        child.material.needsUpdate = true
        magicGoldMaterials.push(child.material)
      })
    },
  })

  // ---- perruche-verte ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/perruche-verte.glb",
    position: [10, 10, -20],
    rotation: [0, Math.PI * 1.5, 0],
    scale: 3,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.02,
    outlineHoverThickness: 0.04,
    onLoad: (model) => {
      model.userData.modelKey = "perruche-verte"
    },
  })

  // ---- perruche-rose ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/perruche-rose.glb",
    position: [12, 10, -20],
    rotation: [0, Math.PI * 1.5, 0],
    scale: 3,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.02,
    outlineHoverThickness: 0.04,
    onLoad: (model) => {
      model.userData.modelKey = "perruche-rose"
    },
  })

  // ---- perruche-bleue ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/perruche-bleue.glb",
    position: [14, 10, -20],
    rotation: [0, Math.PI * 1.5, 0],
    scale: 3,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.02,
    outlineHoverThickness: 0.04,
    onLoad: (model) => {
      model.userData.modelKey = "perruche-bleue"
    },
  })

  // ---- bonhomme-totoro ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/bonhomme-totoro.glb",
    position: [-8, 0, -15],
    rotation: [0, 0, 0],
    scale: 3,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.005,
    outlineHoverThickness: 0.01,
    onLoad: (model) => {
      model.userData.modelKey = "bonhomme-totoro"
    },
  })

  // ---- ramen ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/ramen.glb",
    position: [0, 1, -20],
    rotation: [0, 0, 0],
    scale: 0.01,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    onLoad: (model) => {
      model.userData.modelKey = "ramen"
    },
  })

  // ---- robot ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/robot.glb",
    position: [-12, 1, -15],
    rotation: [0, -Math.PI * 0.5, 0],
    scale: 0.03,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.005,
    outlineHoverThickness: 0.01,
    onLoad: (model) => {
      model.userData.modelKey = "robot"
    },
  })

  // ---- sceau ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/sceau.glb",
    position: [0, 1, -15],
    rotation: [0, -Math.PI * 0.5, 0],
    scale: 1.2,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    // outlineBaseThickness: 0.001,
    // outlineHoverThickness: 0.01,
    onLoad: (model) => {
      model.userData.modelKey = "sceau"
    },
  })

  // ---- train ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/train.glb",
    position: [30, 20, -150],
    rotation: [0, 0, 0],
    scale: 1,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.025,
    outlineHoverThickness: 0.05,
    onLoad: (model) => {
      model.userData.modelKey = "train"
    },
  })

  // ---- totoro ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/totoro.glb",
    position: [-10, -1, -10],
    rotation: [Math.PI * -0.5, 0, Math.PI * 0.5],
    scale: 0.25,
    interactive: true,
    hitboxScale: [0.7, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.005,
    outlineHoverThickness: 0.01,
    onLoad: (model) => {
      model.userData.modelKey = "totoro"
    },
  })

  // ---- warawara ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/warawara.glb",
    position: [10, 5, -20],
    rotation: [0, -Math.PI * 0.5, 0],
    scale: 1,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.025,
    outlineHoverThickness: 0.05,
    onLoad: (model) => {
      model.userData.modelKey = "warawara"
    },
  })

  // ---- yuba ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/yuba.glb",
    position: [5, 0, -20],
    rotation: [0, Math.PI * 0.85, 0],
    scale: 1.25,
    interactive: true,
    hitboxScale: [0.75, 1, 1],
    showHitbox: true,
    outlineBaseThickness: 0.01,
    outlineHoverThickness: 0.02,
    onLoad: (model) => {
      model.userData.modelKey = "yuba"
    },
  })
}
