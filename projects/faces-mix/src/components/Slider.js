import React from 'react'
import * as math from 'mathjs'
import { sample } from 'lodash-es'

export class Slider extends React.Component {
  state = { mix: 0.5 }
  canvas = React.createRef()

  componentDidMount() {
    window
      .fetch('./rotated.json')
      .then(r => r.json())
      .then(data => {
        const from = sample(Object.keys(data.people))
        const to = sample(Object.keys(data.people))
        this.setState({ ...data, from, to }, () => this.draw())
      })
  }

  draw = () => {
    const { people, from, to, mix, coeffs, shape, means } = this.state
    const fakeCanvas = document.createElement('canvas')
    const { width, height } = this.canvas.current.getBoundingClientRect()
    const ctx = fakeCanvas.getContext('2d')
    const fromData = people[from]
    const toData = people[to]
    const mixedData = Array(fromData.length)
      .fill(0)
      .map((_, idx) => {
        const mixedVal = fromData[idx] * (1 - mix) + toData[idx] * mix
        return mixedVal
      })
    const first = math.multiply(mixedData, coeffs)
    const summed = math.add(first, means)
    const imgData = ctx.createImageData(shape[1], shape[0]) // width x height

    for (const pixelIdx in summed) {
      imgData.data[pixelIdx * 4] = summed[pixelIdx] * 255
      imgData.data[pixelIdx * 4 + 1] = summed[pixelIdx] * 255
      imgData.data[pixelIdx * 4 + 2] = summed[pixelIdx] * 255
      imgData.data[pixelIdx * 4 + 3] = 255
    }

    ctx.putImageData(imgData, 0, 0)

    this.canvas.current.width = width
    this.canvas.current.height = height

    const scale = Math.min(height / shape[0], width / shape[1])

    this.canvas.current
      .getContext('2d')
      .drawImage(
        fakeCanvas,
        0,
        0,
        shape[1],
        shape[0],
        (width - shape[1] * scale) / 2,
        (height - shape[0] * scale) / 2,
        shape[1] * scale,
        shape[0] * scale
      )
  }

  handleRange = e => {
    this.setState({ mix: e.target.value }, () => this.draw())
  }

  render() {
    return (
      <div className="w-100 h-100 flex flex-column items-center justify-center">
        <input
          type="range"
          min={0}
          max={1}
          value={this.state.mix}
          step={0.01}
          onChange={this.handleRange}
          className="mb4"
        />
        <canvas className="w-80 h-80" ref={this.canvas} />
      </div>
    )
  }
}
