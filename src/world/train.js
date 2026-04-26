import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/Addons.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'

// ---- Tous les paramètres à régler ici ----
export const TRAIN_CONFIG = {
  // Doit correspondre à mountain.js
  mountainPosition:  new THREE.Vector3(50, -3, -100),
  mountainRotationY: Math.PI,

  // Placement du rail, dans l'espace local de la montagne :
  //   forwardOffset  : distance devant la montagne (positif = devant, négatif = derrière)
  //   lateralOffset  : décalage latéral sur l'axe gauche-droite
  //   yPosition      : hauteur du rail
  //   trackLength    : longueur totale du parcours (aller simple)
  forwardOffset:    12,
  lateralOffset:     5,
  yPosition:         7,
  trackLength:       9,

  // Mouvement
  speed:         3,    // unités par seconde
  pauseDuration: 2.5,  // secondes à l'arrêt à chaque extrémité

  scale:          0.3,
  rotationOffset: Math.PI / 2,   // ajouter Math.PI si le modèle regarde dans le mauvais sens
}

// States
const S = {
  PAUSE_START:     'pause_start',
  MOVING_FORWARD:  'moving_forward',
  PAUSE_END:       'pause_end',
  MOVING_BACKWARD: 'moving_backward',
}

export function loadTrain(scene, config = {}) {
  const cfg = { ...TRAIN_CONFIG, ...config }

  const {
    mountainPosition, mountainRotationY,
    forwardOffset, lateralOffset, yPosition, trackLength,
    speed, pauseDuration,
    scale, rotationOffset,
  } = cfg

  // Axes locaux de la montagne en espace monde
  // droite (+X) :  ( cos θ,  0, -sin θ )
  // devant (-Z) :  (-sin θ,  0, -cos θ )
  const θ = mountainRotationY
  const mountainRight   = new THREE.Vector3( Math.cos(θ), 0, -Math.sin(θ))
  const mountainForward = new THREE.Vector3(-Math.sin(θ), 0, -Math.cos(θ))

  // Centre du rail
  const trackCenter = mountainPosition.clone()
    .addScaledVector(mountainForward, forwardOffset)
    .addScaledVector(mountainRight,   lateralOffset)
  trackCenter.y = yPosition

  // Départ / arrivée le long de l'axe droit de la montagne
  const startPosition = trackCenter.clone().addScaledVector(mountainRight, -trackLength / 2)
  const endPosition   = trackCenter.clone().addScaledVector(mountainRight,  trackLength / 2)

  const travelDist = startPosition.distanceTo(endPosition)
  const travelTime = travelDist / speed

  // Rotation du train : face au sens de déplacement
  const travelDir     = new THREE.Vector3().subVectors(endPosition, startPosition).normalize()
  const forwardAngle = Math.atan2(travelDir.x, travelDir.z) + rotationOffset

  let trainModel = null
  let state      = S.PAUSE_START
  let stateTimer = 0

  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('/draco/')
  const gltfLoader = new GLTFLoader()
  gltfLoader.setDRACOLoader(dracoLoader)
  gltfLoader.setMeshoptDecoder(MeshoptDecoder)

  gltfLoader.load('models/train.glb', (gltf) => {
    trainModel = gltf.scene
    trainModel.position.copy(startPosition)
    trainModel.rotation.y = forwardAngle

    if (Array.isArray(scale)) {
      trainModel.scale.set(...scale)
    } else {
      trainModel.scale.setScalar(scale)
    }

    trainModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    scene.add(trainModel)
  })

  function update(delta) {
    if (!trainModel) return
    stateTimer += delta

    switch (state) {
      case S.PAUSE_START:
        if (stateTimer >= pauseDuration) {
          stateTimer = 0
          state = S.MOVING_FORWARD
          trainModel.rotation.y = forwardAngle
        }
        break

      case S.MOVING_FORWARD: {
        const t = Math.min(stateTimer / travelTime, 1)
        trainModel.position.lerpVectors(startPosition, endPosition, t)
        if (t >= 1) { stateTimer = 0; state = S.PAUSE_END }
        break
      }

      case S.PAUSE_END:
        if (stateTimer >= pauseDuration) {
          stateTimer = 0
          state = S.MOVING_BACKWARD
        }
        break

      case S.MOVING_BACKWARD: {
        const t = Math.min(stateTimer / travelTime, 1)
        trainModel.position.lerpVectors(endPosition, startPosition, t)
        if (t >= 1) { stateTimer = 0; state = S.PAUSE_START }
        break
      }
    }
  }

  return { update }
}
