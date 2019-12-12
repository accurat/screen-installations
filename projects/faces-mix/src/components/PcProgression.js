import React from 'react'
import * as math from 'mathjs'
import { sample } from 'lodash-es'

export class PcProgression extends React.Component {
  state = { pc: 0, maxPc: 10 }
  canvas = React.createRef()

  componentDidMount() {
    window
      .fetch('./rotated.json')
      .then(r => r.json())
      .then(data => {
        const pc = 1
        const maxPc = data.coeffs.length
        const person = sample(Object.keys(data.people))
        this.setState({ ...data, pc, maxPc, person }, () => this.draw())
      })
  }

  draw = () => {
    const fakeCanvas = document.createElement('canvas')
    const { width, height } = this.canvas.current.getBoundingClientRect()
    const ctx = fakeCanvas.getContext('2d')
    const firstPerson = this.state.people[this.state.person]
    const firstPersonData = firstPerson.slice(0, this.state.pc)
    const coeffs = this.state.coeffs.slice(0, this.state.pc)
    const first = math.multiply(firstPersonData, coeffs)
    const summed = math.add(first, this.state.means)
    const imgData = ctx.createImageData(this.state.shape[1], this.state.shape[0]) // width x height

    for (const pixelIdx in summed) {
      imgData.data[pixelIdx * 4] = summed[pixelIdx] * 255
      imgData.data[pixelIdx * 4 + 1] = summed[pixelIdx] * 255
      imgData.data[pixelIdx * 4 + 2] = summed[pixelIdx] * 255
      imgData.data[pixelIdx * 4 + 3] = 255
    }
    ctx.putImageData(imgData, 0, 0)

    this.canvas.current.width = width
    this.canvas.current.height = height

    const scale = Math.min(height / this.state.shape[0], width / this.state.shape[1])

    this.canvas.current
      .getContext('2d')
      .drawImage(
        fakeCanvas,
        0,
        0,
        this.state.shape[1],
        this.state.shape[0],
        (width - this.state.shape[1] * scale) / 2,
        (height - this.state.shape[0] * scale) / 2,
        this.state.shape[1] * scale,
        this.state.shape[0] * scale
      )
  }

  handleRange = e => {
    this.setState({ pc: e.target.value }, () => this.draw())
  }

  render() {
    return (
      <div className="w-100 h-100 flex flex-column items-center justify-center">
        <input
          type="range"
          min={1}
          max={this.state.maxPc}
          value={this.state.pc}
          step={1}
          onChange={this.handleRange}
          className="mb4"
        />
        <canvas className="w-80 h-80" ref={this.canvas} />
      </div>
    )
  }
}
