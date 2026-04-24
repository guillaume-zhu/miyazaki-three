import { createBoxHitbox } from "./createBoxHitbox.js"
import { createGlobalHull } from "./createGlobalHull.js"

export const registerInteractiveModel = (model, interactiveObjects, options = {}) => {
  const {
    hitboxScale = [1, 1, 1],
    showHitbox = true,
    outlineBaseThickness = null,
    outlineHoverThickness = null,
  } = options

  if (outlineBaseThickness !== null && outlineHoverThickness !== null) {
    const outline = createGlobalHull(model, outlineBaseThickness)

    if (outline) {
      model.add(outline)
    }

    model.userData.outline = outline
    model.userData.outlineBaseThickness = outlineBaseThickness
    model.userData.outlineHoverThickness = outlineHoverThickness
  }

  const [sx, sy, sz] = hitboxScale
  const hitbox = createBoxHitbox(model, sx, sy, sz, showHitbox)

  if (hitbox) {
    model.add(hitbox)
    hitbox.userData.model = model
    interactiveObjects.push(hitbox)
  }
}
