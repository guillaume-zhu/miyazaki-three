import * as THREE from "three"
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"

/**
 * Crée un contour unique fusionné pour les meshes statiques d'un modèle.
 */

export const createGlobalHull = (root, thickness = 0.03) => {
  const geometries = []
  const inverseRootMatrix = new THREE.Matrix4()

  root.updateMatrixWorld(true)
  inverseRootMatrix.copy(root.matrixWorld).invert()

  root.traverse((child) => {
    if (!child.isMesh || child.isSkinnedMesh || !child.geometry) {
      return
    }

    const sourceGeometry = child.geometry.index ? child.geometry.toNonIndexed() : child.geometry
    const positionAttribute = sourceGeometry.getAttribute("position")

    if (!positionAttribute) {
      return
    }

    const positions = new Float32Array(positionAttribute.count * 3)

    for (let i = 0; i < positionAttribute.count; i++) {
      const offset = i * 3

      positions[offset] = positionAttribute.getX(i)
      positions[offset + 1] = positionAttribute.getY(i)
      positions[offset + 2] = positionAttribute.getZ(i)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

    const localMatrix = new THREE.Matrix4()
    localMatrix.multiplyMatrices(inverseRootMatrix, child.matrixWorld)
    geometry.applyMatrix4(localMatrix)
    geometries.push(geometry)
  })

  if (geometries.length === 0) {
    return null
  }

  const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false)

  if (!mergedGeometry) {
    console.warn("Global hull ignoré : fusion des géométries impossible pour ce modèle.")
    return null
  }

  const optimizedGeometry = BufferGeometryUtils.mergeVertices(mergedGeometry)
  optimizedGeometry.computeVertexNormals()
  optimizedGeometry.computeBoundingSphere()

  const outlineMaterial = new THREE.ShaderMaterial({
    uniforms: {
      thickness: { value: thickness },
      outlineColor: { value: new THREE.Color(0x000000) },
    },
    vertexShader: `
      uniform float thickness;

      void main() {
        vec3 displacedPosition = position + normal * thickness;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 outlineColor;

      void main() {
        gl_FragColor = vec4(outlineColor, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  })

  const outlineMesh = new THREE.Mesh(optimizedGeometry, outlineMaterial)
  outlineMesh.name = "globalHull"
  outlineMesh.userData.setThickness = (nextThickness) => {
    outlineMaterial.uniforms.thickness.value = nextThickness
  }

  return outlineMesh
}
