import * as THREE from "three"

export class ZoomControls {
  constructor(camera, cameraPivot, mouseTracker) {
    this.camera = camera
    this.cameraPivot = cameraPivot
    this.mouse = mouseTracker.coords

    this.minFov = 15
    this.maxFov = camera.fov
    this.zoomSpeed = 0.05
    this.raycaster = new THREE.Raycaster()

    this.init()
  }

  init() {
    window.addEventListener(
      "wheel",
      (event) => {
        const oldFov = this.camera.fov
        let newFov = oldFov + event.deltaY * this.zoomSpeed
        newFov = Math.max(this.minFov, Math.min(this.maxFov, newFov))

        if (newFov === oldFov) return

        this.raycaster.setFromCamera(this.mouse, this.camera)
        const distanceToTarget = this.camera.position.length()
        const planeNormal = this.camera.position.clone().normalize()
        const plane = new THREE.Plane(planeNormal, -distanceToTarget * 0.6)

        const pointBefore = new THREE.Vector3()
        this.raycaster.ray.intersectPlane(plane, pointBefore)

        this.camera.fov = newFov
        this.camera.updateProjectionMatrix()

        this.raycaster.setFromCamera(this.mouse, this.camera)
        const pointAfter = new THREE.Vector3()
        this.raycaster.ray.intersectPlane(plane, pointAfter)

        if (pointBefore && pointAfter) {
          const delta = pointBefore.clone().sub(pointAfter)
          this.cameraPivot.position.x += delta.x
          this.cameraPivot.position.y += delta.y
        }
      },
      { passive: true },
    )
  }
}
