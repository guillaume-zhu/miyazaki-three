export const getModelFromIntersectedObject = (object) => {
  let current = object

  while (current) {
    if (current.userData?.model) {
      return current.userData.model
    }
    current = current.parent
  }

  return null
}
