export class World {
  constructor(canvas) {
    this.canvas = canvas
    this.songs = []
  }

  get ctx() {
    return this.canvas.getContext('2d')
  }

  updateSongs(songs) {}

  draw() {}
}
