import * as THREE from "three"

/**
 * Fonction création Hitbox pour raycaster hover
 */

export const createBoxHitbox = (root, shrinkX = 1, shrinkY = 1, shrinkZ = 1, visibility) => {
  // Bounding box autour du model dans son repère local
  const box = new THREE.Box3()
  const childBox = new THREE.Box3()
  const inverseRootMatrix = new THREE.Matrix4()

  root.updateMatrixWorld(true)
  inverseRootMatrix.copy(root.matrixWorld).invert()

  root.traverse((child) => {
    if (!child.isMesh || !child.geometry) {
      return
    }

    if (!child.geometry.boundingBox) {
      child.geometry.computeBoundingBox()
    }

    if (!child.geometry.boundingBox) {
      return
    }

    childBox.copy(child.geometry.boundingBox)
    childBox.applyMatrix4(
      new THREE.Matrix4().multiplyMatrices(inverseRootMatrix, child.matrixWorld),
    )
    box.union(childBox)
  })

  if (box.isEmpty()) {
    return null
  }

  // Récupération des dimensions de la box
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())

  // Hitbox
  const geometry = new THREE.BoxGeometry(size.x * shrinkX, size.y * shrinkY, size.z * shrinkZ)
  const material = new THREE.MeshBasicMaterial({
    visible: visibility,
    wireframe: true,
    color: "red",
  })
  const hitbox = new THREE.Mesh(geometry, material)

  // Placement Hitbox
  hitbox.position.copy(center)
  hitbox.name = "boxHitbox"

  return hitbox
}
