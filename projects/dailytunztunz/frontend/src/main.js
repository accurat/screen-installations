import { draw } from './draw'
import { parseSong } from './lib'

const SERVER_URL = 'http://localhost:3001'

function createEmitter() {
  const source = new EventSource(SERVER_URL)
  const listeners = []
  source.onmessage = e => {
    const data = JSON.parse(e.data)
    const songs = data.map(parseSong)
    for (const listener of listeners) {
      listener(songs)
    }
  }
  return {
    add: listener => listeners.push(listener),
  }
}

function start() {
  const canvas = document.createElement('canvas')
  canvas.id = 'canvas'
  document.body.appendChild(canvas)
  const emitter = createEmitter()
  draw(canvas, emitter)
}

document.addEventListener('DOMContentLoaded', start)
