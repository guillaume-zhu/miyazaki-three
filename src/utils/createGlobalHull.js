import * as THREE from "three"
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"

/**
 * Fonction création GlobalHull (fusion des géométries et contours noirs)
 */
export const createGlobalHull = (root, thickness = 0.03) => {
  // Tableau pour stocker les géométries compatibles
  const geometries = []

  // Matrice vide pour convertir les repères monde vers le repère local du model
  const inverseRootMatrix = new THREE.Matrix4()

  // Mise à jour des matrices du modèle avant fusion
  root.updateMatrixWorld(true)

  // Matrices monde -> matrice locale du model
  inverseRootMatrix.copy(root.matrixWorld).invert()

  // Signature de référence des attributs
  let referenceSignature = null

  // Parcours des enfants du modèle
  root.traverse((child) => {
    // Ignore tout ce qui n'est pas un mesh
    if (!child.isMesh || !child.geometry) {
      return
    }

    // Ignore les meshes skinnés pour éviter les problèmes de merge
    if (child.isSkinnedMesh) {
      console.warn("createGlobalHull: SkinnedMesh ignoré", child.name)
      return
    }

    // Ignore les géométries avec morph targets
    if (child.geometry.morphAttributes && Object.keys(child.geometry.morphAttributes).length > 0) {
      console.warn("createGlobalHull: géométrie avec morphAttributes ignorée", child.name)
      return
    }

    // Clone de la géométrie
    const geometry = child.geometry.clone()

    // Signature des attributs de la géométrie
    const signature = Object.entries(geometry.attributes)
      .map(([name, attr]) => `${name}:${attr.itemSize}`)
      .sort()
      .join("|")

    // On garde seulement les géométries compatibles avec la première
    if (referenceSignature === null) {
      referenceSignature = signature
    }

    if (signature !== referenceSignature) {
      console.warn("createGlobalHull: géométrie incompatible ignorée", child.name, signature)
      return
    }

    // Matrice vide pour la transformation du mesh dans l'espace local
    const localMatrix = new THREE.Matrix4()

    // Où se trouve le mesh dans le repère local par rapport au modèle
    localMatrix.multiplyMatrices(inverseRootMatrix, child.matrixWorld)

    // Application de la matrice locale à la géométrie
    geometry.applyMatrix4(localMatrix)

    // Ajout de la géométrie finale dans le tableau
    geometries.push(geometry)
  })

  // Sécurité si aucune géométrie compatible
  if (geometries.length === 0) {
    console.warn("createGlobalHull: aucune géométrie compatible pour", root)
    return null
  }

  // Fusion des géométries
  const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false)

  // Sécurité si merge échoue
  if (!mergedGeometry) {
    console.warn("createGlobalHull: mergeGeometries a échoué pour", root)
    return null
  }

  // Hull
  const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide,
  })

  const outlineMesh = new THREE.Mesh(mergedGeometry, outlineMaterial)
  outlineMesh.scale.multiplyScalar(1 + thickness)
  outlineMesh.name = "globalHull"

  return outlineMesh
}
