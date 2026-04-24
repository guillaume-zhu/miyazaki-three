export class ZoomControls {
  constructor(camera, cameraPivot, mouseTracker) {
    this.camera = camera

    this.minFov = 15
    this.maxFov = camera.fov
    this.zoomSpeed = 0.05

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

        this.camera.fov = newFov
        this.camera.updateProjectionMatrix()
      },
      { passive: true },
    )
  }
}