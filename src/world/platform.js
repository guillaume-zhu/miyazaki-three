import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const TEXTURE_REPEAT = 3

function buildGroundMaterial(grassTexture, center, radius) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uGrassTexture:   { value: grassTexture },
      uTextureRepeat:  { value: TEXTURE_REPEAT },
      uPlatformCenter: { value: new THREE.Vector2(center.x, center.z) },
      uPlatformRadius: { value: radius },
    },

    vertexShader: /* glsl */ `
      varying vec3 vWorldPos;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,

    fragmentShader: /* glsl */ `
      uniform sampler2D uGrassTexture;
      uniform float     uTextureRepeat;
      uniform vec2      uPlatformCenter;
      uniform float     uPlatformRadius;
      varying vec3      vWorldPos;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        // Same world-space UV as grass blades — texture is continuous
        vec2 texUV = (vWorldPos.xz - uPlatformCenter) / (uPlatformRadius * 2.0) + 0.5;
        texUV *= uTextureRepeat;

        // Per-cell random rotation (same trick as grass shader)
        vec2 cellId = floor(texUV);
        float h     = hash(cellId);
        float angle = floor(h * 4.0) * 1.5708;
        vec2 cellUV = fract(texUV) - 0.5;
        float c = cos(angle), s = sin(angle);
        cellUV = vec2(c * cellUV.x - s * cellUV.y, s * cellUV.x + c * cellUV.y);
        cellUV += 0.5 + vec2(hash(cellId + 1.0), hash(cellId + 2.0)) * 0.5;

        vec3 texColor = texture2D(uGrassTexture, cellUV).rgb;

        // Minimum luminance boost (same as grass)
        float lum    = dot(texColor, vec3(0.299, 0.587, 0.114));
        float minLum = 0.25;
        if (lum < minLum) {
          float boost = min(minLum / max(lum, 0.01), 2.0);
          texColor *= boost;
        }

        // Ground is darker than blade tips
        texColor *= 0.72;

        gl_FragColor = vec4(texColor, 1.0);
      }
    `,

    side: THREE.FrontSide,
  })
}

export async function loadPlatform(scene) {
  const textureLoader  = new THREE.TextureLoader()
  const grassTexture   = textureLoader.load('/textures/grass.jpeg')
  grassTexture.wrapS   = THREE.RepeatWrapping
  grassTexture.wrapT   = THREE.RepeatWrapping
  grassTexture.colorSpace    = THREE.SRGBColorSpace
  grassTexture.minFilter     = THREE.LinearMipMapLinearFilter
  grassTexture.magFilter     = THREE.LinearFilter

  const loader = new GLTFLoader()

  try {
    const gltf     = await loader.loadAsync('/models/platform.glb')
    const platform = gltf.scene
    platform.position.set(0, 0, 0)

    const box    = new THREE.Box3().setFromObject(platform)
    const center = new THREE.Vector3()
    box.getCenter(center)
    const size   = new THREE.Vector3()
    box.getSize(size)
    const radius = Math.max(size.x, size.z) / 2

    const mat = buildGroundMaterial(grassTexture, center, radius)

    platform.traverse((child) => {
      if (child.isMesh) {
        child.material       = mat
        child.castShadow     = true
        child.receiveShadow  = true
      }
    })

    scene.add(platform)
    return platform

  } catch (err) {
    const geo    = new THREE.CylinderGeometry(10, 10, 2, 32)
    const center = new THREE.Vector3(0, -1, 0)
    const mat    = buildGroundMaterial(grassTexture, center, 10)
    const placeholder = new THREE.Mesh(geo, mat)
    placeholder.position.y = -1
    scene.add(placeholder)
    return placeholder
  }
}
