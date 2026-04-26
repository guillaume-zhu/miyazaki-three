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
    position: [25, 10, -60],
    rotation: [0, Math.PI * 1.5, 0],
    interactive: true,
    animated: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    showHitbox: false,
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
    position: [-3, 5.5, -20],
    rotation: [Math.PI * 0.25, Math.PI * -0.25, Math.PI * 0.5],
    scale: 0.05,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    position: [0, -3, -80],
    rotation: [0, Math.PI * 0.5, 0],
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
    outlineBaseThickness: 0.03,
    outlineHoverThickness: 0.05,
    onLoad: (model) => {
      model.userData.modelKey = "bateau-ponyo"
    },
  })

  // ---- Calcifer ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/calcifer.glb",
    position: [10, 1, -20],
    scale: 0.3,
    interactive: true,
    animated: true,
    hitboxScale: [0.3, 0.5, 0.3],
    showHitbox: false,
    onLoad: (model) => {
      model.userData.modelKey = "calcifer"
    },
  })

  // ---- Canne ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/canne.glb",
    position: [15, 5, -30],
    scale: 2,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
    outlineBaseThickness: 0.04,
    outlineHoverThickness: 0.08,
    onLoad: (model) => {
      model.userData.modelKey = "canne"
    },
  })

  // ---- Chapeau de paille ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/chapeau-paille.glb",
    position: [-2, 2, -20],
    scale: 0.1,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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

  // ---- Chihiro ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/chihiro.glb",
    position: [20, 0, -25],
    rotation: [0, Math.PI * 1.5, 0],
    scale: 0.35,
    interactive: true,
    animated: true,
    hitboxScale: [0.3, 1, 1],
    showHitbox: false,
    onLoad: (model) => {
      model.userData.modelKey = "chihiro"
    },
  })

  // ---- Couteau ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/couteau.glb",
    position: [-20, 10, -20],
    rotation: [0, Math.PI * 0.5, Math.PI * -0.75],
    scale: 0.002,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    scale: 0.25,
    interactive: true,
    hitboxScale: [0.8, 1, 1],
    showHitbox: false,
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
    position: [15, 3, -30],
    scale: 2,
    rotation: [Math.PI * -0.5, Math.PI * 0.25, Math.PI * 0.25],
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
    outlineBaseThickness: 0.015,
    outlineHoverThickness: 0.03,
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
    position: [-15, 0, -25],
    rotation: [0, Math.PI * -0.75, 0],
    scale: 2.75,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    position: [-20, 0, -25],
    rotation: [0, -Math.PI * 0.25, 0],
    scale: 0.05,
    interactive: true,
    hitboxScale: [0.5, 1, 1],
    showHitbox: false,
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
    position: [-24, 0, -25],
    rotation: [0, Math.PI * 1, 0],
    scale: 5,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
    outlineBaseThickness: 0.005,
    outlineHoverThickness: 0.01,
  })

  // ---- Le Chateau ambulant ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/chateau-ambulant.glb",
    position: [30, 10, -150],
    rotation: [0, -Math.PI * 0.5, 0],
    scale: 0.4,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
    outlineBaseThickness: 0.005,
    outlineHoverThickness: 0.01,
  })

  // ---- Le Chateau laputa ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/chateau-laputa.glb",
    position: [25, 30, -175],
    rotation: [0, 0, 0],
    scale: 10,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    position: [-9, 4, -23],
    rotation: [0, Math.PI * -0.25, 0],
    scale: 1.8,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    position: [-1, 3, -22],
    rotation: [Math.PI * -0.25, 0, 0],
    scale: 0.25,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    position: [18, 1, -28],
    rotation: [0, -Math.PI * 0.3, 0],
    scale: 1,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    position: [-12, 2, -15],
    rotation: [0, Math.PI * 0.1, 0],
    scale: 10,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    position: [-18, 5, -30],
    rotation: [0, Math.PI * 0.5, 0],
    scale: 0.05,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    position: [10, 10, -35],
    rotation: [0, Math.PI * 1.3, 0],
    scale: 3,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    position: [12, 10, -35],
    rotation: [0, Math.PI * 1.3, 0],
    scale: 3,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    position: [14, 10, -35],
    rotation: [0, Math.PI * 1.3, 0],
    scale: 3,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    position: [-20, 0, -35],
    rotation: [0, 0, 0],
    scale: 3,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    position: [0, 1, -28],
    rotation: [0, 0, 0],
    scale: 0.01,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    position: [-17, 1, -27],
    rotation: [0, -Math.PI * 0.5, 0],
    scale: 0.03,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    position: [-2, 1, -28],
    rotation: [0, -Math.PI * 0.5, 0],
    scale: 1.2,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    position: [40, 20, -170],
    rotation: [0, 0, 0],
    scale: 1,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    position: [-20, -1, -30],
    rotation: [Math.PI * -0.5, 0, Math.PI * 0.5],
    scale: 0.25,
    interactive: true,
    hitboxScale: [0.7, 1, 1],
    showHitbox: false,
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
    position: [5, 5, -25],
    rotation: [0, -Math.PI * 0.5, 0],
    scale: 1,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
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
    position: [8, 0, -28],
    rotation: [0, Math.PI * 0.85, 0],
    scale: 1.25,
    interactive: true,
    hitboxScale: [0.75, 1, 1],
    showHitbox: false,
    outlineBaseThickness: 0.01,
    outlineHoverThickness: 0.02,
    onLoad: (model) => {
      model.userData.modelKey = "yuba"
    },
  })
}
