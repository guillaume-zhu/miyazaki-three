import * as THREE from "three"

/**
 * Crée une hitbox locale autour d'un modèle pour le raycaster.
 * On calcule la box dans l'espace local du root pour éviter
 * une double application du scale quand la hitbox est ajoutée au modèle.
 */
export const createBoxHitbox = (
  root,
  shrinkX = 1,
  shrinkY = 1,
  shrinkZ = 1,
  visibility = false,
) => {
  root.updateWorldMatrix(true, true)

  // Sert à convertir les transforms monde des meshes vers l'espace local du root
  const inverseRootMatrix = new THREE.Matrix4().copy(root.matrixWorld).invert()

  const localBox = new THREE.Box3()
  let hasMesh = false

  root.traverse((child) => {
    if (!child.isMesh || !child.geometry) return

    hasMesh = true

    if (!child.geometry.boundingBox) {
      child.geometry.computeBoundingBox()
    }

    const childBox = child.geometry.boundingBox.clone()

    // Exprime la box du mesh dans le repère local du modèle parent
    const localMatrix = new THREE.Matrix4().multiplyMatrices(inverseRootMatrix, child.matrixWorld)

    childBox.applyMatrix4(localMatrix)
    localBox.union(childBox)
  })

  if (!hasMesh || localBox.isEmpty()) {
    return null
  }

  const size = localBox.getSize(new THREE.Vector3())
  const center = localBox.getCenter(new THREE.Vector3())

  const geometry = new THREE.BoxGeometry(size.x * shrinkX, size.y * shrinkY, size.z * shrinkZ)

  const material = new THREE.MeshBasicMaterial({
    visible: visibility,
    wireframe: true,
    color: "red",
  })

  const hitbox = new THREE.Mesh(geometry, material)
  hitbox.position.copy(center)
  hitbox.name = "boxHitbox"

  return hitbox
}
