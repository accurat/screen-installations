const { min, max, sqrt, sin, cos, abs } = Math
const MAX_SIDE = 200
const MAGIC_CONSTANT = 75

const directions = {
  hor: s => ['yellow', 'pink', s.energy],
  dec: s => ['lightblue', 'violet', s.acousticness],
  inc: s => ['orange', 'blue', s.instrumentalness],
}

export function getSongSides(song, now) {
  const playedUntil = song.endedAt || now
  const played = max(0, playedUntil - song.startedAt)
  const partPlayed = min(1, played / song.duration)
  const side = (0.1 + partPlayed * 0.9) * MAX_SIDE
  return [side, side / sqrt(3)]
}

export function getSongX(song, now) {
  const period = MAGIC_CONSTANT + MAGIC_CONSTANT * (1 - song.energy)
  const delta = (song.danceability * sin(now / period) ** 2) / period
  return song.x + delta
}

export function getSongY(song, now) {
  const period = MAGIC_CONSTANT + MAGIC_CONSTANT * (1 - song.energy)
  const delta = (song.danceability * cos(now / period)) / period
  return song.y + delta
}

export function getSongGradient(song, direction) {
  const [leftColor, rightColor, center] = directions[direction](song)
  const availableSpace = 1 - abs(0.5 - center)
  const left = max(0, center - availableSpace / 2)
  const right = min(1, center + availableSpace / 2)
  return [
    [left / 2, leftColor],
    [right / 2, rightColor],
  ]
}

export function parseSong(song) {
  const {
    acousticness,
    danceability,
    duration_ms,
    energy,
    instrumentalness,
    key,
    id,
    liveness,
    loudness,
    mode,
    progress_ms,
    speechiness,
    tempo,
    time_signature,
    user_id,
    valence,
    x,
    y,
  } = song
  const songId = `${user_id}-${id}`
  const startedAt = Date.now() - progress_ms
  const duration = duration_ms
  const playing = true
  return {
    startedAt,
    duration,
    valence,
    acousticness,
    id: songId,
    playing,
    danceability,
    tempo,
    energy,
    instrumentalness,
    x,
    y,
  }
}

export function getSongAlpha(song, now) {
  if (song.playing) return 1
  const timeSincePlayed = now - song.endedAt
  if (timeSincePlayed > MAX_DELAY_AFTER_PLAYING) return 0.5
  return (0.5 * (MAX_DELAY_AFTER_PLAYING - timeSincePlayed)) / MAX_DELAY_AFTER_PLAYING
}
