import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js"
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js"

import { loadInteractiveModel } from "../utils/loadInteractiveModel.js"
import { initGameInterface, onModelsLoaded } from "../hud/HUD.js"
import { setGameReady } from "../main.js"

// fonction du son:
function playSound(file, vol = 1.0) {
  let audio = new Audio(file)
  audio.volume = vol
  audio.play()
}

/**
 * Animations
 */

// Train
const createTrainXAnimation = (model, { distance = 9, speed = 3, pauseDuration = 2.5 } = {}) => {
  const startX = model.position.x
  const endX = startX + distance

  let direction = 1
  let pauseTimer = pauseDuration

  return (delta) => {
    if (pauseTimer > 0) {
      pauseTimer -= delta
      return
    }

    model.position.x += direction * speed * delta

    if (direction === 1 && model.position.x >= endX) {
      model.position.x = endX
      direction = -1
      pauseTimer = pauseDuration
    }

    if (direction === -1 && model.position.x <= startX) {
      model.position.x = startX
      direction = 1
      pauseTimer = pauseDuration
    }
  }
}

// Gold
const createMagicGoldAnimation = (
  model,
  materials,
  {
    floatAmplitude = 0.08,
    floatSpeed = 2,
    pulseBase = 2.5,
    pulseAmplitude = 0.4,
    pulseSpeed = 4,
    rotationSpeed = 1,
  } = {},
) => {
  const baseY = model.position.y

  return (delta, t) => {
    model.position.y = baseY + Math.sin(t * floatSpeed) * floatAmplitude
    model.rotation.y += rotationSpeed * delta

    for (const material of materials) {
      if ("emissiveIntensity" in material) {
        material.emissiveIntensity = pulseBase + Math.sin(t * pulseSpeed) * pulseAmplitude
      }
    }
  }
}

/**
 * Import
 */
export const loadModels = ({ scene, camera, renderer, interactiveObjects, mixers, modelAnimations = [] }) => {
  // ---------------------------------- LOGIQUE LOADER -----------------------------------------------------
  // --- Éléments du DOM ---
  const loaderBar = document.getElementById("loader-bar")
  const loaderText = document.getElementById("loader-text")
  const loaderScreen = document.getElementById("loader-screen")

  // --- Initialisation du Loading Manager ---
  const loadingManager = new THREE.LoadingManager()

  loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progressRatio = (itemsLoaded / itemsTotal) * 100
    // On utilise requestAnimationFrame pour synchroniser la mise à jour avec l'écran
    window.requestAnimationFrame(() => {
      if (loaderBar) {
        loaderBar.style.width = `${progressRatio}%`
      }
      if (loaderText) {
        // On arrondit pour éviter les chiffres à virgule qui bougent trop
        loaderText.innerText = `Récupération de la mémoire... ${Math.round(progressRatio)}%`
      }
    })
  }

  loadingManager.onLoad = () => {
    const progressGroup = document.getElementById("loader-progress-group")
    const launchBtn = document.getElementById("launch-btn")
    const loaderScreen = document.getElementById("loader-screen")

    // Pré-compilation des shaders et upload des géométries/textures au GPU
    // pendant l'écran de chargement → zéro freeze quand le joueur entre dans la scène
    if (renderer && camera) {
      renderer.compile(scene, camera)
    }

    if (progressGroup) progressGroup.style.display = "none"

    if (launchBtn) {
      launchBtn.onclick = () => {
        playSound("./sound/Ghibli-sounds-shortened.MP3")
        // 1. On cache le loader
        loaderScreen.classList.add("loader-hidden")

        // 2. ON APPELLE LES RÈGLES (C'est ce qui manquait !)
        // On attend un tout petit peu que le fondu du loader commence
        setTimeout(() => {
          initGameInterface()
        }, 1000)

        // 3. On autorise le clic sur les modèles 3D après un délai
        // pour éviter que le clic du bouton ne traverse et n'ouvre un quiz
        setTimeout(() => {
          setGameReady() // On utilise la fonction importée de main.js
        }, 1500)
      }
    }

    // On prévient HUD que le chargement est terminé
    onModelsLoaded()
  }

  // --- Configuration des Loaders avec le Manager ---
  const dracoLoader = new DRACOLoader(loadingManager)
  dracoLoader.setDecoderPath("/draco/")

  const gltfLoader = new GLTFLoader(loadingManager)
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
    scale: 1,
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
    position: [-10, 8, -23],
    rotation: [Math.PI * 0.25, Math.PI, 0],
    scale: 0.2,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
    outlineBaseThickness: 0.0001,
    outlineHoverThickness: 0.01,
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
    position: [13, 0.5, -20],
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
    position: [-6, 1.55, -32],
    scale: 0.2,
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
    position: [42, 10.5, -92],
    scale: 0.4,
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
    position: [-12.5, 0, -25.25],
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
    position: [-15.5, 0.5, -25],
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
    onLoad: (model) => {
      model.userData.modelKey = "lanterne"
    },
  })

  // ---- Le Chateau ambulant ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/chateau-ambulant.glb",
    position: [40, 2.5, -68],
    rotation: [0, -Math.PI * 0.5, 0],
    scale: 0.25,
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
    position: [80, 30, -150],
    rotation: [0, 0, 0],
    scale: 10,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
    outlineBaseThickness: 0.005,
    outlineHoverThickness: 0.01,
    onLoad: (model) => {
      model.userData.modelKey = "chateau-laputa"
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
    position: [-2.8, 1.15, -29.2],
    rotation: [Math.PI * -0.2, Math.PI * 0, 0],
    scale: 0.5,
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

      const goldMaterials = []

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
        goldMaterials.push(child.material)
      })

      modelAnimations.push(
        createMagicGoldAnimation(model, goldMaterials, {
          floatAmplitude: 0.08,
          floatSpeed: 2,
          pulseBase: 2.5,
          pulseAmplitude: 0.4,
          pulseSpeed: 4,
          rotationSpeed: 1,
        }),
      )
    },
  })

  // ---- perruche-verte ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/perruche-verte.glb",
    position: [19, 7.7, -33],
    rotation: [0, Math.PI * 1.25, 0],
    scale: 1,
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
    position: [-15, 0.8, -31],
    rotation: [0, Math.PI * 0.25, 0],
    scale: 1.25,
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
    position: [-4.5, 2.65, -31],
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
    position: [-11.5, 1, -19],
    rotation: [0, Math.PI * -0.2, 0],
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
    position: [-4.5, 1, -27],
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
    position: [47, 18, -100],
    rotation: [0, 0, 0],
    scale: 0.5,
    interactive: true,
    hitboxScale: [1, 1, 1],
    showHitbox: false,
    outlineBaseThickness: 0.01,
    outlineHoverThickness: 0.02,
    onLoad: (model) => {
      model.userData.modelKey = "train"
      modelAnimations.push(
        createTrainXAnimation(model, {
          distance: 20,
          speed: 3,
          pauseDuration: 2.5,
        }),
      )
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
    rotation: [Math.PI * -0.5, 0, Math.PI * 0.7],
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
    position: [11, 4.5, -30],
    rotation: [0, -Math.PI * 0.75, Math.PI * 0.1],
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

  /**
   * Décors
   */
  // ---- cerisier ----
  // loadInteractiveModel({
  //   gltfLoader,
  //   scene,
  //   interactiveObjects,
  //   mixers,
  //   path: "models/assets/cerisier.glb",
  //   position: [20, 0, -30],
  //   rotation: [0, -Math.PI * 0.25, 0],
  //   scale: 7,
  //   interactive: true,
  //   hitboxScale: [0.75, 1, 1],
  //   showHitbox: false,
  //   onLoad: (model) => {
  //     model.traverse((child) => {
  //       if (!child.isMesh || !child.material) return

  //       child.material = child.material.clone()

  //       // branches / tronc
  //       if (child.name.includes("Oak_Bark") || child.material.name.includes("SHD_trunk")) {
  //         child.material.color.set("#af9f9f")
  //         child.material.color.multiplyScalar(0.8)
  //       }

  //       // fleurs
  //       if (child.name.includes("rsSprite1") || child.material.name.includes("rsSprite1")) {
  //         child.material.color.set("#fff2e7")
  //         child.material.color.multiplyScalar(1)
  //       }

  //       if ("envMapIntensity" in child.material) {
  //         child.material.envMapIntensity = 0.6
  //       }

  //       child.material.needsUpdate = true
  //     })
  //   },
  // })

  // ---- table ----
  loadInteractiveModel({
    gltfLoader,
    scene,
    interactiveObjects,
    mixers,
    path: "models/assets/table.glb",
    position: [-5, 1.5, -30],
    rotation: [0, Math.PI * 0.25, 0],
    scale: 3,
    interactive: true,
    hitboxScale: [0, 0, 0],
    showHitbox: false,
    outlineBaseThickness: 0.01,
    outlineHoverThickness: 0.01,
    onLoad: (model) => {
      model.traverse((child) => {
        if (!child.isMesh || !child.material) return

        child.material.color.multiplyScalar(0.6)
      })
    },
  })

  // ---- rocks (1 seul chargement, 6 clones) ----
  // La géométrie est uploadée une fois sur le GPU et partagée entre les 6 instances.
  // Les 6 hitboxScale:[0,0,0] précédents sont supprimés → raycaster allégé.
  gltfLoader.load("models/assets/rock.glb", (gltf) => {
    const rockConfigs = [
      { position: [6, 0, -24], rotation: [0, Math.PI * 0.5, 0], scale: 0.005 },
      { position: [5, 0, -25], rotation: [0, 0, 0], scale: 0.0075 },
      { position: [0, 0, -20], rotation: [0, Math.PI * 0.5, 0], scale: 0.005 },
      { position: [-11, 0, -24], rotation: [0, 0, 0], scale: 0.005 },
      { position: [-14, 0, -25], rotation: [0, Math.PI, 0], scale: 0.006 },
      { position: [-14, -0.75, -32.5], rotation: [0, Math.PI, 0], scale: 0.006 },
    ]

    for (const { position, rotation, scale } of rockConfigs) {
      const rock = gltf.scene.clone()
      rock.position.set(...position)
      rock.rotation.set(...rotation)
      rock.scale.setScalar(scale)

      // On clone le matériau pour que multiplyScalar soit indépendant par instance
      rock.traverse((child) => {
        if (!child.isMesh || !child.material) return
        child.material = child.material.clone()
        child.material.color.multiplyScalar(1.5)
      })

      scene.add(rock)
    }
  })
}
