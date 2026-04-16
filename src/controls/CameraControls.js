import * as THREE from "three"
import { ZoomControls } from "./ZoomControls.js"
import { RotationControls } from "./RotationControls.js"

export class CameraControls {
  constructor(camera, scene, mouseTracker) {
    this.camera = camera
    this.scene = scene
    this.mouseTracker = mouseTracker

    /**
     * Pivot
     */
    this.cameraPivot = new THREE.Group()
    this.scene.add(this.cameraPivot)
    this.cameraPivot.add(this.camera)

    /**
     * Sub-systems
     */
    const rotationControls = new RotationControls(camera)
    new ZoomControls(camera, this.cameraPivot, mouseTracker)

    /**
     * Properties mapping
     */
    Object.defineProperty(this, "hasMoved", {
      get: () => rotationControls.hasMoved,
    })
  }
}
