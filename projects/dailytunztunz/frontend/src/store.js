import { readable } from 'svelte/store'
// import { tween } from 'svelte/easing'

const SERVER_URL = 'http://localhost:5001'

export const musicData = readable({}, currentData)

function currentData(setter) {
  const source = new EventSource(SERVER_URL)
  source.onmessage = e => {
    const data = JSON.parse(e.data)
    const songs = data.reduce((acc, s) => {
      const id = `${s.user_id}-${s.id}`
      const played = s.progress_ms / s.duration_ms
      const x = s.valence
      const y = s.danceability
      return { ...acc, [id]: { played, x, y } }
    }, {})

    console.log(musicData)

    setter(songs)
  }
}
