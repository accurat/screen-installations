const { min, max, sqrt, sin, cos, floor } = Math
const MAX_SIDE = 200

export function getSongSides(song, now) {
  const playedUntil = song.endedAt || now
  const played = max(0, playedUntil - song.startedAt)
  const partPlayed = min(1, played / song.duration)
  const side = (0.1 + partPlayed * 0.9) * MAX_SIDE
  return [side, side / sqrt(3)]
}

export function getSongX(song, now) {
  const period = 50 + 50 * (1 - song.energy)
  const delta = (song.danceability * sin(now / period)) / 100
  return song.valence + delta
}

export function getSongY(song, now) {
  const period = 50 + 50 * (1 - song.energy)
  const delta = (song.danceability * cos(now / period)) / 100
  return song.acousticness + delta
}

export function parseSong(song) {
  console.log('song', song)
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
  }
}

export function getSongAlpha(song, now) {
  if (song.playing) return 1
  const timeSincePlayed = now - song.endedAt
  if (timeSincePlayed > MAX_DELAY_AFTER_PLAYING) return 0.5
  return (0.5 * (MAX_DELAY_AFTER_PLAYING - timeSincePlayed)) / MAX_DELAY_AFTER_PLAYING
}
