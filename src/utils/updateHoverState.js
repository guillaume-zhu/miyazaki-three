export const updateHoverState = (hoveredModel, newHoveredModel) => {
  if (hoveredModel !== newHoveredModel) {
    if (hoveredModel && hoveredModel.userData.outline) {
      hoveredModel.userData.outline.userData.setThickness(
        hoveredModel.userData.outlineBaseThickness,
      )
    }

    if (newHoveredModel && newHoveredModel.userData.outline) {
      newHoveredModel.userData.outline.userData.setThickness(
        newHoveredModel.userData.outlineHoverThickness,
      )
    }

    hoveredModel = newHoveredModel
  }

  return hoveredModel
}
