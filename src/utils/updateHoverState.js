export const updateHoverState = (hoveredModel, newHoveredModel) => {
  if (hoveredModel !== newHoveredModel) {
    if (hoveredModel && hoveredModel.userData.outline) {
      const baseThickness = hoveredModel.userData.outlineBaseThickness
      hoveredModel.userData.outline.scale.setScalar(1 + baseThickness)
    }

    if (newHoveredModel && newHoveredModel.userData.outline) {
      const hoverThickness = newHoveredModel.userData.outlineHoverThickness
      newHoveredModel.userData.outline.scale.setScalar(1 + hoverThickness)
    }

    hoveredModel = newHoveredModel
  }

  return hoveredModel
}
