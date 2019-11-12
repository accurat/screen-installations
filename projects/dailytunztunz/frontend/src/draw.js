import _ from 'lodash'
import { getSongSides, getSongX, getSongY } from './lib'
const { PI } = Math

function getSize(canvas) {
  return canvas.getBoundingClientRect()
}

function setSize(canvas) {
  const size = getSize(canvas)
  canvas.width = size.width * 2
  canvas.height = size.height * 2
}

function updateSongs(songs, newSongs) {
  const now = Date.now()
  const newSongIds = newSongs.map(s => s.id)
  const oldSongIds = songs.map(s => s.id)
  for (const song of songs) {
    const playing = newSongIds.includes(song.id)
    if (playing || !song.playing) continue
    song.playing = false
    song.endedAt = now
  }
  for (const song of newSongs) {
    const exists = oldSongIds.includes(song.id)
    if (exists) continue
    songs.push(song)
  }
  console.log(songs)
}

function drawSongs(canvas, songs, now) {
  const ctx = canvas.getContext('2d')
  const { width, height } = getSize(canvas)
  ctx.clearRect(0, 0, width, height)
  for (const song of songs) {
    const alpha = song.playing ? 1 : 0.4
    const x = getSongX(song, now)
    const y = getSongY(song, now)
    ctx.save()
    const [w, h] = getSongSides(song, now)
    const rectVals = [-w / 2, -h / 2, w, h]
    ctx.translate(x * width, y * height)
    ctx.rotate(PI / 3)
    ctx.fillStyle = `rgba(256, 0, 0, ${alpha})`
    ctx.fillRect(...rectVals)
    ctx.rotate(PI / 3)
    ctx.fillStyle = `rgba(0, 256, 0, ${alpha})`
    ctx.fillRect(...rectVals)
    ctx.rotate(PI / 3)
    ctx.fillStyle = `rgba(0, 0, 256, ${alpha})`
    ctx.fillRect(...rectVals)
    ctx.restore()
  }
  window.requestAnimationFrame(() => drawSongs(canvas, songs, Date.now()))
}

function createListener(songs) {
  return newSongs => updateSongs(songs, newSongs)
}

export function draw(canvas, emitter) {
  const songs = []
  const listener = createListener(songs)
  emitter.add(listener)
  setSize(canvas)
  drawSongs(canvas, songs, Date.now())
}
