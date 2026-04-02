export const updateHoverState = (hoveredModel, newHoveredModel) => {
  if (hoveredModel !== newHoveredModel) {
    if (hoveredModel && hoveredModel.userData.hull) {
      hoveredModel.userData.hull.scale.setScalar(hoveredModel.userData.hullBaseScale)
    }

    if (newHoveredModel && newHoveredModel.userData.hull) {
      newHoveredModel.userData.hull.scale.setScalar(newHoveredModel.userData.hullHoverScale)
    }

    hoveredModel = newHoveredModel
  }

  return hoveredModel
}
