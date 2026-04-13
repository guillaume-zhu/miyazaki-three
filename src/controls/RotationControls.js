import * as THREE from "three"

// Pre-allocated objects reused every frame to avoid garbage collection
const _baseQuat = new THREE.Quaternion()
const _yawQuat = new THREE.Quaternion()
const _yawedQuat = new THREE.Quaternion()
const _pitchQuat = new THREE.Quaternion()
const _rightAxis = new THREE.Vector3()
const _worldUp = new THREE.Vector3(0, 1, 0)

function lerp(x, y, t) {
    return (1 - t) * x + t * y
}

export class RotationControls {
    constructor(camera) {
        this.camera = camera

        this.isDragging = false
        this.hasMoved = false

        // Rotation cible (mise à jour au drag)
        this.targetRotation = { x: 0, y: 0 }

        // Rotation smoothée (lerp vers target)
        this.smoothedRotation = { x: 0, y: 0 }

        this.rotationSpeed = 0.003
        this.smoothingFactor = 0.08

        this.minYaw = -Math.PI / 4
        this.maxYaw = Math.PI / 4
        this.minPitch = -0.3
        this.maxPitch = 0.3

        this.init()
        this.startSmoothing()
    }

    init() {
        window.addEventListener("mousedown", (event) => {
            if (event.button !== 0) return
            this.isDragging = true
            this.hasMoved = false
        })

        window.addEventListener("mouseup", () => {
            this.isDragging = false
        })

        window.addEventListener("mouseleave", () => {
            this.isDragging = false
        })

        window.addEventListener("mousemove", (event) => {
            if (!this.isDragging) return

            if (event.movementX !== 0 || event.movementY !== 0) {
                this.hasMoved = true
            }

            // Directions cardinales uniquement
            const absX = Math.abs(event.movementX)
            const absY = Math.abs(event.movementY)

            let deltaX = 0
            let deltaY = 0

            if (absX > absY) {
                deltaX = event.movementX
            } else {
                deltaY = event.movementY
            }

            this.targetRotation.y -= deltaX * this.rotationSpeed
            this.targetRotation.x -= deltaY * this.rotationSpeed

            // Clamp
            this.targetRotation.y = Math.max(this.minYaw, Math.min(this.maxYaw, this.targetRotation.y))
            this.targetRotation.x = Math.max(this.minPitch, Math.min(this.maxPitch, this.targetRotation.x))
        })
    }

    startSmoothing() {
        const tick = () => {
            this.smoothedRotation.x = lerp(this.smoothedRotation.x, this.targetRotation.x, this.smoothingFactor)
            this.smoothedRotation.y = lerp(this.smoothedRotation.y, this.targetRotation.y, this.smoothingFactor)

            // Repartir de l'identité, pas du quaternion actuel
            _baseQuat.identity()

            // Yaw : rotation autour de l'axe Y monde
            _yawQuat.setFromAxisAngle(_worldUp, this.smoothedRotation.y)
            _yawedQuat.copy(_yawQuat).multiply(_baseQuat)

            // Pitch : rotation autour de l'axe X local (après yaw)
            _rightAxis.set(1, 0, 0).applyQuaternion(_yawedQuat)
            _pitchQuat.setFromAxisAngle(_rightAxis, this.smoothedRotation.x)

            this.camera.quaternion.copy(_pitchQuat.multiply(_yawedQuat))

            requestAnimationFrame(tick)
        }

        tick()
    }
}