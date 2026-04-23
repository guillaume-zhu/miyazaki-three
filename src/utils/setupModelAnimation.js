import * as THREE from "three"

export const setupModelAnimation = (model, gltf, mixers) => {
  if (!gltf.animations || gltf.animations.length === 0) {
    return null
  }

  const mixer = new THREE.AnimationMixer(model)
  const action = mixer.clipAction(gltf.animations[0])
  action.play()

  mixers.push(mixer)
  model.userData.mixer = mixer
  model.userData.action = action

  return { mixer, action }
}
