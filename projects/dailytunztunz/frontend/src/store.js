import { readable } from 'svelte/store'

const SERVER_URL = 'http://localhost:5001'

function currentData(setter) {
  const source = new EventSource(SERVER_URL)
  source.onmessage = e => {
    const data = JSON.parse(e.data)
    setter(data)
  }
}

export const musicData = readable([], currentData)
