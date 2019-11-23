import { getSongSides, getSongX, getSongY, getSongGradient } from './lib'
const { PI } = Math

function getSize(canvas) {
  const { width, height } = canvas.getBoundingClientRect()
  return {
    width: width * 2,
    height: height * 2,
  }
}

function setSize(canvas) {
  const size = getSize(canvas)
  canvas.width = size.width
  canvas.height = size.height
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
  ctx.globalAlpha = 1
  ctx.clearRect(0, 0, width, height)
  for (const song of songs) {
    const alpha = song.playing ? 1 : 0.8
    const x = getSongX(song, now)
    const y = getSongY(song, now)
    ctx.save()
    const [w, h] = getSongSides(song, now)
    const rectVals = [-w / 2, -h / 2, w, h]
    ctx.globalAlpha = alpha
    ctx.translate(x * width, y * height)
    const [horLeft, horRight] = getSongGradient(song, 'hor')
    const horGrad = ctx.createLinearGradient(...rectVals)
    horGrad.addColorStop(...horLeft)
    horGrad.addColorStop(...horRight)
    ctx.fillStyle = horGrad
    ctx.fillRect(...rectVals)
    ctx.rotate(-PI / 3)
    const [decLeft, decRight] = getSongGradient(song, 'dec')
    const decGrad = ctx.createLinearGradient(...rectVals)
    decGrad.addColorStop(...decLeft)
    decGrad.addColorStop(...decRight)
    ctx.fillStyle = decGrad
    ctx.fillRect(...rectVals)
    ctx.rotate(-PI / 3)
    const [incLeft, incRight] = getSongGradient(song, 'inc')
    const incGrad = ctx.createLinearGradient(...rectVals)
    incGrad.addColorStop(...incLeft)
    incGrad.addColorStop(...incRight)
    ctx.fillStyle = incGrad
    ctx.restore()
  }
  window.requestAnimationFrame(() => drawSongs(canvas, songs, Date.now()))
}

function createListener(songs) {
  return newSongs => updateSongs(songs, newSongs)
}

export function draw(canvas, emitter) {
  const songs = []
  setSize(canvas)
  const listener = createListener(songs)
  emitter.add(listener)
  drawSongs(canvas, songs, Date.now())
}
