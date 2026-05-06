import { registerInteractiveModel } from "./registerInteractiveModel.js"
import { setupModelAnimation } from "./setupModelAnimation.js"

export const loadInteractiveModel = ({
  gltfLoader,
  scene,
  interactiveObjects,
  mixers,
  path,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  interactive = false,
  hitboxScale = [1, 1, 1],
  showHitbox = true,
  outlineBaseThickness = null,
  outlineHoverThickness = null,
  animated = false,
  onLoad = null,
}) => {
  gltfLoader.load(path, (gltf) => {
    const model = gltf.scene

    // Transformations
    model.position.set(...position)
    model.rotation.set(...rotation)

    if (Array.isArray(scale)) {
      model.scale.set(...scale)
    } else {
      model.scale.setScalar(scale)
    }

    scene.add(model)

    // Hook perso pour traitements spéciaux
    if (onLoad) {
      onLoad(model, gltf)
    }

    // Interaction
    if (interactive) {
      registerInteractiveModel(model, interactiveObjects, {
        hitboxScale,
        showHitbox,
        outlineBaseThickness,
        outlineHoverThickness,
      })
    }

    // Animation
    if (animated) {
      setupModelAnimation(model, gltf, mixers)
    }
  })
}
