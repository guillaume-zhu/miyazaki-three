import * as THREE from "three"

/**
 * Fonction création Hitbox pour raycaster hover
 */

export const createBoxHitbox = (root, shrinkX = 1, shrinkY = 1, shrinkZ = 1, visibility) => {
  // Bounding box autour du model
  const box = new THREE.Box3().setFromObject(root)

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
  root.updateMatrixWorld(true)
  root.worldToLocal(center)
  hitbox.position.copy(center)
  hitbox.name = "boxHitbox"

  return hitbox
}
