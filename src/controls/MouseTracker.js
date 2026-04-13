import * as THREE from "three"

export class MouseTracker {
  constructor(canvas) {
    this.canvas = canvas
    this.coords = new THREE.Vector2()

    this.canvas.addEventListener("mousemove", (event) => {
      const rect = this.canvas.getBoundingClientRect()
      this.coords.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      this.coords.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    })
  }
}
