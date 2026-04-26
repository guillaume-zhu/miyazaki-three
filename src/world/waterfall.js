import * as THREE from 'three'

export function createWaterfall(scene) {
  const group = new THREE.Group()

  const height = 17;

  // ---- Stream shader ----
  const streamGeo = new THREE.PlaneGeometry(2, height, 4, 40)

  const streamMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:        { value: 0 },
      uColor:       { value: new THREE.Color('#a8d8e8') },
      uFoamColor:   { value: new THREE.Color('#ffffff') },
      uSpeed:       { value: 0.7 },
      uTopWidth:    { value: 0.6 },  // largeur en haut  (0→1 = fraction du plan)
      uBottomWidth: { value: 1 }, // largeur en bas
      uSplitY:      { value: 0.6 },  // hauteur de la transition (0=bas, 1=haut)
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,

    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,

    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3  uColor;
      uniform vec3  uFoamColor;
      uniform float uSpeed;
      uniform float uTopWidth;
      uniform float uBottomWidth;
      uniform float uSplitY;
      varying vec2  vUv;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289v2(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
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
        // Scroll downward (positive Y = top, subtract time to fall)
        vec2 uv = vec2(vUv.x, vUv.y + uTime * uSpeed * 0.12);

        // Two noise layers for streaky look
        float n1 = snoise(uv * vec2(2.5, 6.0));
        n1 = n1 * 0.5 + 0.5;
        float n2 = snoise(uv * vec2(4.0, 12.0) + 1.7);
        n2 = n2 * 0.5 + 0.5;

        float streak = smoothstep(0.35, 0.65, n1 * n2 * 0.9);

        // Largeur variable : étroite en haut, large en bas
        float width  = mix(uBottomWidth, uTopWidth, step(uSplitY, vUv.y));
        float margin = (1.0 - width) * 0.5;
        float edgeFade = smoothstep(margin, margin + 0.04, vUv.x) *
                         smoothstep(1.0 - margin, 1.0 - margin - 0.04, vUv.x);
        // Top / bottom fade
        float fade = edgeFade * smoothstep(1.0, 0.92, vUv.y) * smoothstep(0.0, 0.08, vUv.y);

        vec3 color = mix(uColor, uFoamColor, streak * 0.25);
        float alpha = fade * (0.55 + streak * 0.2);

        gl_FragColor = vec4(color, alpha);
      }
    `,
  })

  const stream = new THREE.Mesh(streamGeo, streamMat)
  stream.position.y = height / 2
  group.add(stream)

  // ---- Splash pool at the base ----
  const splashGeo = new THREE.CircleGeometry(2.8, 24)
  const splashMat = new THREE.MeshBasicMaterial({
    color: '#bde2eb',
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  const splash = new THREE.Mesh(splashGeo, splashMat)
  splash.rotation.x = -Math.PI / 2
  splash.position.y = 0.05
  group.add(splash)

  // ---- Position on the mountain ----
  // Adjust these values to match where the waterfall sits on the model
  group.position.set(44, -3, -90)
  group.rotation.y = Math.PI / 6

  scene.add(group)

  return streamMat
}
