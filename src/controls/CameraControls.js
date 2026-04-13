import * as THREE from "three"
import { MouseTracker } from "./MouseTracker.js"
import { ZoomControls } from "./ZoomControls.js"
import { RotationControls } from "./RotationControls.js"

export class CameraControls {
  constructor(camera, scene, canvas) {
    this.camera = camera
    this.scene = scene
    this.canvas = canvas

    /**
     * Pivot
     */
    this.cameraPivot = new THREE.Group()
    this.scene.add(this.cameraPivot)
    this.cameraPivot.add(this.camera)

    /**
     * Sub-systems
     */
    const mouseTracker = new MouseTracker(canvas)
    const rotationControls = new RotationControls(camera)
    new ZoomControls(camera, this.cameraPivot, mouseTracker)

    /**
     * Properties mapping
     */
    Object.defineProperty(this, "hasMoved", {
      get: () => rotationControls.hasMoved
    })
  }
}