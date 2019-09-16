import paperColors from 'paper-colors'
import { cloneDeep, sample } from 'lodash-es'
import chroma from 'chroma-js'

export function randomHex() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}

const colors = paperColors.map(c => c.hex)
const colorsPool = cloneDeep(colors)
export function paperColor(): string {
  if (colorsPool.length > 0) {
    return colorsPool.pop()
  }

  // simulate the palette just by changing the hue
  const randColor = chroma(sample(colors)).set('hsl.h', Math.round(Math.random() * 360))
  return randColor.hex()
}
