import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export function createControls(camera, domElement) {
    const controls = new OrbitControls(camera, domElement)

    controls.target.set(0, 2, -10)

    controls.minPolarAngle = Math.PI * 0.45
    controls.maxPolarAngle = Math.PI * 0.45

    controls.minDistance = 6
    controls.maxDistance = 14

    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.4
    controls.enablePan = false

    controls.update()
    return controls
}
