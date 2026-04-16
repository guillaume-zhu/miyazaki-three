import * as THREE from "three"

export function createWater(scene) {
  const floorGeo = new THREE.CircleGeometry(500, 64)
  const floorMat = new THREE.MeshBasicMaterial({
    color: "#bde2eb",
    side: THREE.DoubleSide,
  })
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -3.05
  floor.renderOrder = 0
  scene.add(floor)

  const geometry = new THREE.CircleGeometry(300, 64)

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#bde2eb") },
      uColorWave: { value: new THREE.Color("#ffffff") },
      uTextureSize: { value: 3.0 },
      uWaveSpeed: { value: 0.4 },
      uWaveAmplitude: { value: 0.03 },
    },

    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uWaveSpeed;
      uniform float uWaveAmplitude;

      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.y += sin(uTime * uWaveSpeed) * uWaveAmplitude;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,

    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3  uColor;
      uniform vec3  uColorWave;
      uniform float uTextureSize;

      varying vec2 vUv;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187,  0.366025403784439,
                           -0.577350269189626,  0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289v2(i);
        vec3 p  = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m  = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m * m; m = m * m;
        vec3 x_ = 2.0 * fract(p * C.www) - 1.0;
        vec3 h  = abs(x_) - 0.5;
        vec3 ox = floor(x_ + 0.5);
        vec3 a0 = x_ - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        float textureSize = 100.0 - uTextureSize;

        vec3 color = uColor;

        float noiseBase = snoise(vUv * (textureSize * 2.8) + sin(uTime * 0.08));
        noiseBase = noiseBase * 0.5 + 0.5;
        float foam = smoothstep(0.04, 0.001, noiseBase);
        foam = step(0.5, foam);

        float noiseWaves = snoise(vUv * textureSize + sin(uTime * -0.03));
        noiseWaves = noiseWaves * 0.5 + 0.5;
        float threshold = 0.6 + 0.01 * sin(uTime * 0.6);
        float waveEffect = 1.0 - (
          smoothstep(threshold + 0.03, threshold + 0.032, noiseWaves) +
          smoothstep(threshold, threshold - 0.01, noiseWaves)
        );
        waveEffect = step(0.5, waveEffect);

        float combined = min(waveEffect + foam, 1.0);
        color = mix(color, uColorWave, combined * 0.35);

        gl_FragColor = vec4(color, 1.0);
      }
    `,

    side: THREE.DoubleSide,
  })

  const water = new THREE.Mesh(geometry, material)
  water.rotation.x = -Math.PI / 2
  water.position.y = -3
  water.renderOrder = 1
  scene.add(water)

  return material
}
