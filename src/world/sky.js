import * as THREE from 'three'

// export function createSky(scene) {
//   const skyGeo = new THREE.SphereGeometry(200, 32, 32)
//   const loader = new THREE.TextureLoader()

//   const skyTexture = loader.load('/textures/sky.png')
//   skyTexture.colorSpace = THREE.SRGBColorSpace
//   skyTexture.minFilter = THREE.LinearFilter
//   skyTexture.magFilter = THREE.LinearFilter

//   const skyMat = new THREE.MeshBasicMaterial({
//     map: skyTexture,
//     side: THREE.BackSide,
//     depthWrite: false,
//     fog: false,
//   })

//   const sky = new THREE.Mesh(skyGeo, skyMat)
//   sky.rotation.y = Math.PI
//   scene.add(sky)

//   return sky
// }

//                                                        ancien ciel


export function createSky(scene) {
    const skyGroup = new THREE.Group()

    // --- 1. LE DÉGRADÉ VIBRANT (Shader) ---
    const skyGeo = new THREE.SphereGeometry(450, 32, 32)
    
    const skyMat = new THREE.ShaderMaterial({
        uniforms: {
            // Couleurs ajustées pour un look plus "bleu ciel" et lumineux
            topColor: { value: new THREE.Color("#0077ff") },    // Bleu ciel saturé
            bottomColor: { value: new THREE.Color("#87ceeb") }, // Bleu azur clair
            horizonColor: { value: new THREE.Color("#ffffff") }, // Blanc lumineux pour l'horizon
            exponent: { value: 0.5 }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform vec3 horizonColor;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize( vWorldPosition ).y;
                // On crée un mélange entre le blanc de l'horizon et le bleu du ciel
                vec3 sky = mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0));
                vec3 finalColor = mix(horizonColor, sky, smoothstep(-0.1, 0.2, h));
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        side: THREE.BackSide,
        depthWrite: false
    })

    const skyMesh = new THREE.Mesh(skyGeo, skyMat)
    skyGroup.add(skyMesh)

    // --- 2. LES NUAGES MULTIPLES (Sprites) ---
    const loader = new THREE.TextureLoader()
    
    // Si tu as plusieurs images (cloud1.png, cloud2.png), charge-les dans un tableau
    const cloudTexture = loader.load('/img/cloud-ghibli.png') 
    
    const cloudCount = 18 // Plus de nuages pour remplir l'espace
    for (let i = 0; i < cloudCount; i++) {
        const spriteMat = new THREE.SpriteMaterial({ 
            map: cloudTexture, 
            transparent: true, 
            opacity: 0.9,
            // On ajoute une légère variation de teinte pour chaque nuage
            color: new THREE.Color().setHSL(0.6, 0.1, 0.9 + Math.random() * 0.1) 
        })
        const cloud = new THREE.Sprite(spriteMat)

        // On place les nuages de manière aléatoire mais structurée
        const angle = Math.random() * Math.PI * 2
        const radius = 200 + Math.random() * 150
        
        cloud.position.set(
            Math.cos(angle) * radius,
            30 + Math.random() * 60,
            Math.sin(angle) * radius
        )

        // VARIATION DE TAILLE (Crucial pour éviter l'effet "copier-coller")
        const scale = 60 + Math.random() * 80
        cloud.scale.set(scale, scale * 0.5, 1)

        cloud.userData.angle = angle
        cloud.userData.radius = radius
        cloud.userData.speed = 0.00005 + Math.random() * 0.0001 // Dérive très lente
        
        skyGroup.add(cloud)
    }

    // --- 3. ANIMATION ---
    skyGroup.onBeforeRender = () => {
        skyGroup.children.forEach(child => {
            if(child instanceof THREE.Sprite) {
                child.userData.angle += child.userData.speed
                child.position.x = Math.cos(child.userData.angle) * child.userData.radius
                child.position.z = Math.sin(child.userData.angle) * child.userData.radius
            }
        })
    }

    scene.add(skyGroup)
    return skyGroup
}