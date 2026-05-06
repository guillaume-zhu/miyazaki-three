import * as THREE from 'three'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'

// Patch Three.js prototypes for BVH-accelerated raycasting (~50x faster)
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast

export function createGrass(scene, platformMesh) {
  const BLADE_COUNT        = 100000
  const BLADE_HEIGHT       = 1
  const BLADE_WIDTH        = 0.08
  const RAY_ORIGIN_Y       = 50
  const TEXTURE_REPEAT     = 3

  const EXCLUSION_CENTER   = new THREE.Vector2(13, -20)
  const EXCLUSION_RADIUS   = 4
  const EXCLUSION_RADIUS_SQ = EXCLUSION_RADIUS * EXCLUSION_RADIUS

  const box = new THREE.Box3().setFromObject(platformMesh)
  const size = new THREE.Vector3()
  box.getSize(size)
  const center = new THREE.Vector3()
  box.getCenter(center)
  const RADIUS = Math.max(size.x, size.z) / 2

  const textureLoader = new THREE.TextureLoader()
  const grassTexture = textureLoader.load('/textures/grass.jpeg')
  grassTexture.wrapS = THREE.RepeatWrapping
  grassTexture.wrapT = THREE.RepeatWrapping
  grassTexture.colorSpace = THREE.SRGBColorSpace
  grassTexture.minFilter = THREE.LinearMipMapLinearFilter
  grassTexture.magFilter = THREE.LinearFilter

  const CAMERA_FORWARD_ANGLE = -Math.PI / 2
  const VISIBLE_ARC_HALF = Math.PI * 0.65 / 2

  function isInVisibleArc(x, z) {
    const angle = Math.atan2(z - center.z, x - center.x)
    let diff = angle - CAMERA_FORWARD_ANGLE
    if (diff > Math.PI) diff -= Math.PI * 2
    else if (diff < -Math.PI) diff += Math.PI * 2
    return Math.abs(diff) < VISIBLE_ARC_HALF
  }

  // --- Blade geometry (shared) ---
  const bladeGeo = new THREE.BufferGeometry()
  const positions = new Float32Array([
    -BLADE_WIDTH * 0.5,  0.0, 0,
     BLADE_WIDTH * 0.5,  0.0, 0,
    -BLADE_WIDTH * 0.25, 0.5, 0,
     BLADE_WIDTH * 0.25, 0.5, 0,
     0.0,                1.0, 0,
  ])
  const uvs = new Float32Array([
    0.0, 0.0,  1.0, 0.0,
    0.0, 0.5,  1.0, 0.5,
    0.5, 1.0,
  ])
  const indices = new Uint16Array([0, 1, 2, 2, 1, 3, 2, 3, 4])
  bladeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  bladeGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  bladeGeo.setIndex(new THREE.BufferAttribute(indices, 1))

  // --- Collect meshes for raycasting ---
  const meshes = []
  if (platformMesh.isMesh) {
    meshes.push(platformMesh)
  } else {
    platformMesh.traverse((child) => { if (child.isMesh) meshes.push(child) })
  }

  // --- Build BVH acceleration structures ---
  meshes.forEach((m) => {
    if (!m.geometry.boundsTree) {
      m.geometry.computeBoundsTree()
    }
  })

  // --- Reusable raycast objects (avoid per-call allocations) ---
  const raycaster = new THREE.Raycaster()
  const rayDir = new THREE.Vector3(0, -1, 0)
  const _rayOrigin = new THREE.Vector3()

  function getSurfaceY(x, z) {
    _rayOrigin.set(x, RAY_ORIGIN_Y, z)
    raycaster.set(_rayOrigin, rayDir)
    const hits = raycaster.intersectObjects(meshes, false)
    return hits.length > 0 ? hits[0].point.y : null
  }

  // --- Simplex noise setup ---
  const perm = new Uint8Array(512)
  const grad2 = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]
  {
    const p = new Uint8Array(256)
    for (let i = 0; i < 256; i++) p[i] = i
    let seed = 42
    for (let i = 255; i > 0; i--) {
      seed = (seed * 16807) % 2147483647
      const j = seed % (i + 1)
      const tmp = p[i]; p[i] = p[j]; p[j] = tmp
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255]
  }

  function dot2(gi, x, y) { const g = grad2[gi & 7]; return g[0]*x + g[1]*y }

  const F2 = 0.5 * (Math.sqrt(3) - 1)
  const G2 = (3 - Math.sqrt(3)) / 6

  function simplex2D(xin, yin) {
    const s = (xin + yin) * F2
    const i = Math.floor(xin + s), j = Math.floor(yin + s)
    const t = (i + j) * G2
    const x0 = xin - (i - t), y0 = yin - (j - t)
    let i1, j1
    if (x0 > y0) { i1=1; j1=0 } else { i1=0; j1=1 }
    const x1=x0-i1+G2, y1=y0-j1+G2, x2=x0-1+2*G2, y2=y0-1+2*G2
    const ii=i&255, jj=j&255
    const gi0=perm[ii+perm[jj]], gi1=perm[ii+i1+perm[jj+j1]], gi2=perm[ii+1+perm[jj+1]]
    let n0=0, n1=0, n2=0
    let t0=0.5-x0*x0-y0*y0; if(t0>0){t0*=t0;n0=t0*t0*dot2(gi0,x0,y0)}
    let t1=0.5-x1*x1-y1*y1; if(t1>0){t1*=t1;n1=t1*t1*dot2(gi1,x1,y1)}
    let t2=0.5-x2*x2-y2*y2; if(t2>0){t2*=t2;n2=t2*t2*dot2(gi2,x2,y2)}
    return 70*(n0+n1+n2)
  }

  function bumpNoise(x, z) {
    let value=0, amplitude=1.0, frequency=0.15, maxAmp=0
    for(let i=0;i<5;i++){
      value+=amplitude*simplex2D(x*frequency,z*frequency)
      maxAmp+=amplitude; amplitude*=0.5; frequency*=2.2
    }
    return value/maxAmp
  }

  // --- Pre-allocate typed arrays (avoid push + convert) ---
  const offsets   = new Float32Array(BLADE_COUNT * 3)
  const scales    = new Float32Array(BLADE_COUNT)
  const rotations = new Float32Array(BLADE_COUNT)
  const leans     = new Float32Array(BLADE_COUNT)
  let placed = 0
  const maxAttempts = BLADE_COUNT * 2
  const invRadius = 1.0 / RADIUS

  for (let i = 0; i < maxAttempts && placed < BLADE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.sqrt(Math.random()) * RADIUS
    const x = center.x + Math.cos(angle) * radius
    const z = center.z + Math.sin(angle) * radius

    if (!isInVisibleArc(x, z)) continue

    const dxExcl = x - EXCLUSION_CENTER.x
    const dzExcl = z - EXCLUSION_CENTER.y
    if (dxExcl * dxExcl + dzExcl * dzExcl < EXCLUSION_RADIUS_SQ) continue

    const surfaceY = getSurfaceY(x, z)
    if (surfaceY === null) continue

    const idx3 = placed * 3
    offsets[idx3]     = x
    offsets[idx3 + 1] = surfaceY
    offsets[idx3 + 2] = z

    const bump = bumpNoise(x, z)
    const bumpScale = 0.3 + (bump + 1) * 0.75
    const individualRandom = 0.85 + Math.random() * 0.3
    const radiusRatio = radius * invRadius
    const edgeFalloff = 1.0 - radiusRatio * radiusRatio * radiusRatio * 0.5
    scales[placed]    = bumpScale * individualRandom * edgeFalloff
    rotations[placed] = Math.random() * Math.PI
    leans[placed]     = (Math.random() - 0.5) + (Math.random() - 0.5)
    placed++
  }

  // Use subarray views (no copy) if not all slots were filled
  const finalOffsets   = placed < BLADE_COUNT ? offsets.subarray(0, placed * 3)   : offsets
  const finalScales    = placed < BLADE_COUNT ? scales.subarray(0, placed)        : scales
  const finalRotations = placed < BLADE_COUNT ? rotations.subarray(0, placed)     : rotations
  const finalLeans     = placed < BLADE_COUNT ? leans.subarray(0, placed)         : leans

  // --- Instanced geometry ---
  const instancedGeo = new THREE.InstancedBufferGeometry()
  instancedGeo.index = bladeGeo.index
  instancedGeo.attributes.position = bladeGeo.attributes.position
  instancedGeo.attributes.uv = bladeGeo.attributes.uv
  instancedGeo.setAttribute('aOffset',   new THREE.InstancedBufferAttribute(finalOffsets,   3))
  instancedGeo.setAttribute('aScale',    new THREE.InstancedBufferAttribute(finalScales,    1))
  instancedGeo.setAttribute('aRotation', new THREE.InstancedBufferAttribute(finalRotations, 1))
  instancedGeo.setAttribute('aLean',     new THREE.InstancedBufferAttribute(finalLeans,     1))

  // --- Wind direction normalized on CPU (once) ---
  const windDir = new THREE.Vector2(1.0, 0.3).normalize()

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime:           { value: 0 },
      uGrassTexture:   { value: grassTexture },
      uTextureRepeat:  { value: TEXTURE_REPEAT },
      uPlatformRadius: { value: RADIUS },
      uPlatformCenter: { value: new THREE.Vector2(center.x, center.z) },
      uBaseDarken:     { value: 0.45 },
      uWindSpeed:      { value: 1.0 },
      uWindStrength:   { value: 0.35 },
      uWindDirection:  { value: windDir },
      uWindWaveSize:   { value: 8.0 },
    },

    vertexShader: `
      attribute vec3  aOffset;
      attribute float aScale;
      attribute float aRotation;
      attribute float aLean;
      uniform float uTime;
      uniform float uWindSpeed;
      uniform float uWindStrength;
      uniform vec2  uWindDirection;
      uniform float uWindWaveSize;
      varying float vHeight;
      varying float vWindBend;
      varying vec3  vWorldPos;

      vec2 rotate2D(vec2 v, float a) {
        float s = sin(a); float c = cos(a);
        return vec2(v.x*c - v.y*s, v.x*s + v.y*c);
      }

      void main() {
        vec3 pos = position;
        float dist = length(aOffset.xz);
        float widthBoost = 1.0 + dist * 0.03;
        pos.x *= widthBoost;
        pos.y *= aScale * ${BLADE_HEIGHT.toFixed(2)};
        pos.xz = rotate2D(pos.xz, aRotation);

        float uvY = uv.y;
        float uvY2 = uvY * uvY;

        // Lean: approx pow(uv.y, 1.8) with uvY2 * sqrt(uvY) ~= pow(y, 2.5)
        // Using uvY2 as a close-enough approximation for pow(y, 1.8)
        float leanCurve = uvY * uvY2;
        float leanAmount = aLean * 0.45;
        float sinRot = sin(aRotation);
        float cosRot = cos(aRotation);
        pos.x += sinRot * leanAmount * leanCurve;
        pos.z += cosRot * leanAmount * leanCurve;
        pos.y -= abs(leanAmount) * leanCurve * 0.1;

        // Wind — uWindDirection already normalized on CPU
        vec2 windDir = uWindDirection;
        float phase = dot(aOffset.xz, windDir) / uWindWaveSize;
        float timeScaled = uTime * uWindSpeed;
        float mainWave   = sin(phase + timeScaled);
        float detailWave = sin(phase * 2.3 + timeScaled * 1.7) * 0.3;
        float windForce  = (mainWave + detailWave) * uWindStrength;

        // Bend: approx pow(uv.y, 2.5) with uvY2 * sqrt(uvY)
        float bendFactor = uvY2 * sqrt(uvY);
        float windBend = windForce * bendFactor;
        pos.x += windDir.x * windBend;
        pos.z += windDir.y * windBend;
        pos.y -= abs(windForce) * bendFactor * 0.15;

        pos += aOffset;
        vHeight   = uvY;
        vWindBend = windBend;
        vWorldPos = aOffset;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,

    fragmentShader: `
      uniform sampler2D uGrassTexture;
      uniform float     uTextureRepeat;
      uniform float     uPlatformRadius;
      uniform vec2      uPlatformCenter;
      uniform float     uBaseDarken;
      varying float vHeight;
      varying float vWindBend;
      varying vec3  vWorldPos;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        float invDiameter = 1.0 / (uPlatformRadius * 2.0);
        vec2 texUV = (vWorldPos.xz - uPlatformCenter) * invDiameter + 0.5;
        texUV *= uTextureRepeat;

        vec2 cellId = floor(texUV);
        float h = hash(cellId);
        float angle = floor(h * 4.0) * 1.5708;
        vec2 cellUV = fract(texUV) - 0.5;
        float c = cos(angle), s = sin(angle);
        cellUV = vec2(c * cellUV.x - s * cellUV.y, s * cellUV.x + c * cellUV.y);
        cellUV += 0.5 + vec2(hash(cellId + 1.0), hash(cellId + 2.0)) * 0.5;

        vec3 texColor = texture2D(uGrassTexture, cellUV).rgb;

        float lum = dot(texColor, vec3(0.299, 0.587, 0.114));
        float minLum = 0.25;
        if (lum < minLum) {
          float boost = min(minLum / max(lum, 0.01), 2.0);
          texColor *= boost;
        }

        // AO + tip highlight combined
        float ao = smoothstep(0.0, 0.3, vHeight);
        texColor *= mix(1.0 - uBaseDarken, 1.0, ao);
        texColor += smoothstep(0.5, 1.0, vHeight) * 0.2;

        // Wind tint
        texColor *= clamp(1.0 + vWindBend * 0.35, 0.75, 1.25);

        // Desaturate
        float gray = dot(texColor, vec3(0.299, 0.587, 0.114));
        texColor = mix(vec3(gray), texColor, 0.65);

        texColor *= 1.1;
        gl_FragColor = vec4(texColor, 1.0);
      }
    `,

    side: THREE.DoubleSide,
    transparent: false,
  })

  const grass = new THREE.Mesh(instancedGeo, material)
  grass.frustumCulled = false
  scene.add(grass)
  return material
}