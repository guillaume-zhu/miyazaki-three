import * as THREE from "three"
import { Reflector } from "three/examples/jsm/objects/Reflector.js"

const WATER_COLOR = "#aeb7b4"

/* ── Gaussian blur séparable (9-tap) ── */
const blurShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 direction;   // (1,0) horizontal  |  (0,1) vertical
    uniform float strength;
    uniform vec2 resolution;
    varying vec2 vUv;
    uniform float saturation;
    uniform float brightness;
    uniform vec3 reflectionTint;
    uniform float tintStrength;

    void main() {
      vec2 off = direction * strength / resolution;

      vec4 sum  = texture2D(tDiffuse, vUv - 4.0 * off) * 0.0162162162;
      sum      += texture2D(tDiffuse, vUv - 3.0 * off) * 0.0540540541;
      sum      += texture2D(tDiffuse, vUv - 2.0 * off) * 0.1216216216;
      sum      += texture2D(tDiffuse, vUv - 1.0 * off) * 0.1945945946;
      sum      += texture2D(tDiffuse, vUv)              * 0.2270270270;
      sum      += texture2D(tDiffuse, vUv + 1.0 * off) * 0.1945945946;
      sum      += texture2D(tDiffuse, vUv + 2.0 * off) * 0.1216216216;
      sum      += texture2D(tDiffuse, vUv + 3.0 * off) * 0.0540540541;
      sum      += texture2D(tDiffuse, vUv + 4.0 * off) * 0.0162162162;

      float gray = dot(sum.rgb, vec3(0.2126, 0.7152, 0.0722));
      sum.rgb = mix(vec3(gray), sum.rgb, saturation);
      sum.rgb *= brightness;
      sum.rgb = mix(sum.rgb, reflectionTint, tintStrength);

      gl_FragColor = sum;
    }
  `,
}

/* ── Helpers pour le full-screen pass ── */
function createBlurMaterial(
  dir,
  res,
  saturation = 1.0,
  brightness = 1.0,
  tintColor = new THREE.Color(WATER_COLOR),
  tintStrength = 0.0,
) {
  return new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      direction: { value: dir },
      strength: { value: 2.0 },
      resolution: { value: res },
      saturation: { value: saturation },
      brightness: { value: brightness },
      reflectionTint: { value: tintColor },
      tintStrength: { value: tintStrength },
    },
    vertexShader: blurShader.vertexShader,
    fragmentShader: blurShader.fragmentShader,
    depthTest: false,
    depthWrite: false,
  })
}

/* ══════════════════════════════════════════
  createWater  –  Reflector + blurred reflection
   ══════════════════════════════════════════ */
export function createWater(scene) {
  const reflectionFog = new THREE.Fog("#ff8000", 800, 3000)

  const texW = 1024
  const texH = 1024
  const res = new THREE.Vector2(texW, texH)

  const geometry = new THREE.CircleGeometry(4000, 64)
  const water = new Reflector(geometry, {
    textureWidth: texW,
    textureHeight: texH,
    clipBias: 0.003,
    color: new THREE.Color(WATER_COLOR),
  })
  water.rotation.x = -Math.PI / 2
  water.position.y = -3
  scene.add(water)

  /* ── Render target intermédiaire (ping-pong) ── */
  const blurRT = new THREE.WebGLRenderTarget(texW, texH, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  })

  /* ── Matériaux blur H & V ── */
  const matH = createBlurMaterial(
    new THREE.Vector2(1, 0),
    res,
    1.0,
    1.0,
    new THREE.Color(WATER_COLOR),
    0.0,
  )
  const matV = createBlurMaterial(
    new THREE.Vector2(0, 1),
    res,
    0.88,
    1.1,
    new THREE.Color(WATER_COLOR),
    0.25,
  )

  /* ── Full-screen quad pour les passes ── */
  const fsQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2))
  const fsScene = new THREE.Scene()
  fsScene.add(fsQuad)
  const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  /* ── Config ── */
  let iterations = 1 // nombre de passes H+V (plus = plus flou)

  /* ── Hook sur le cycle de rendu du Reflector ── */
  const originalOnBeforeRender = water.onBeforeRender.bind(water)

  water.onBeforeRender = function (renderer, scene, camera) {
    const savedFog = scene.fog
    scene.fog = reflectionFog
    // 1. Rendu normal de la réflexion dans le renderTarget interne
    originalOnBeforeRender(renderer, scene, camera)

    const reflectionRT = water.getRenderTarget()
    const savedRT = renderer.getRenderTarget()
    const savedAutoClear = renderer.autoClear
    renderer.autoClear = false

    for (let i = 0; i < iterations; i++) {
      // 2. Pass horizontal : reflectionRT → blurRT
      matH.uniforms.tDiffuse.value = reflectionRT.texture
      fsQuad.material = matH
      renderer.setRenderTarget(blurRT)
      renderer.clear()
      renderer.render(fsScene, fsCam)

      // 3. Pass vertical : blurRT → reflectionRT
      matV.uniforms.tDiffuse.value = blurRT.texture
      fsQuad.material = matV
      renderer.setRenderTarget(reflectionRT)
      renderer.clear()
      renderer.render(fsScene, fsCam)
    }

    // Restaurer l'état du renderer
    renderer.setRenderTarget(savedRT)
    renderer.autoClear = savedAutoClear
    scene.fog = savedFog
  }

  /* ── API publique ── */
  const setBlur = (amount) => {
    matH.uniforms.strength.value = amount
    matV.uniforms.strength.value = amount
  }

  const setIterations = (n) => {
    iterations = Math.max(1, n)
  }

  const setReflectionSaturation = (amount) => {
    matV.uniforms.saturation.value = THREE.MathUtils.clamp(amount, 0, 1.5)
  }

  const setReflectionBrightness = (amount) => {
    matV.uniforms.brightness.value = THREE.MathUtils.clamp(amount, 0.5, 2.0)
  }

  const setReflectionTintStrength = (amount) => {
    matV.uniforms.tintStrength.value = THREE.MathUtils.clamp(amount, 0, 1)
  }

  return {
    mesh: water,
    material: water.material,
    setBlur, // setBlur(8)  → plus flou   |  setBlur(0) → net
    setIterations, // setIterations(3) → blur très large
    setReflectionSaturation,
    setReflectionBrightness,
    setReflectionTintStrength,
  }
}
