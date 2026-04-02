import * as THREE from "three"
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"

/**
 * Fonction création GlobalHull (fusion des géométries et contours noirs)
 */

export const createGlobalHull = (root, thickness = 0.03) => {
  // Tableau pour stocker les géometries
  const geometries = []

  // ---- Copie et fusion des géométries ---- //
  // Matrice vide pour convertir les répères monde vers le repère du model
  const inverseRootMatrix = new THREE.Matrix4()

  // Mise à jour des matrices du modèle avant fusion
  root.updateMatrixWorld(true)

  // Matrices mondes à matrices locales du model
  inverseRootMatrix.copy(root.matrixWorld).invert()

  // Parcours des child du model
  root.traverse((child) => {
    // Si child n'est pas un mesh
    if (!child.isMesh) {
      return
    }

    // Clonage des géométries
    const geometry = child.geometry.clone()

    // Matrice vide pour la transformation du mesh dans l'espace local
    const localMatrix = new THREE.Matrix4()

    // Ou se trouve le mesh dans repère local par rapport au modèle
    localMatrix.multiplyMatrices(inverseRootMatrix, child.matrixWorld)

    // Inclusion des matrices dans le monde aux géométries copiées
    geometry.applyMatrix4(localMatrix)

    // Ajout de la géométrie finale dans le tableau
    geometries.push(geometry)
  })

  // Sécurité si modèle aucun mesh
  if (geometries.length === 0) {
    return null
  }

  // Fusion des géometries
  const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false)

  // ---- Hull ---- //
  const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide,
  })

  const outlineMesh = new THREE.Mesh(mergedGeometry, outlineMaterial)
  outlineMesh.scale.multiplyScalar(1 + thickness)
  outlineMesh.name = "globalHull"

  return outlineMesh
}
