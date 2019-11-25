import React from 'react'
import * as math from 'mathjs'

export class App extends React.Component {
  state = { pc: 0, maxPc: 10 }
  canvas = React.createRef()

  componentDidMount() {
    window
      .fetch('./rotated.json')
      .then(r => r.json())
      .then(data => {
        const pc = 1
        const maxPc = data.coeffs.length
        this.setState({ ...data, pc, maxPc }, () => this.draw())
      })
  }

  draw = () => {
    const ctx = this.canvas.current.getContext('2d')
    const firstPerson = this.state.people['marta_palmisano']
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
  }

  handleRange = e => {
    this.setState({ pc: e.target.value }, () => this.draw())
  }

  render() {
    return (
      <div>
        <canvas className="w-100 h-100" ref={this.canvas} />
        <input
          type="range"
          min={1}
          max={this.state.maxPc}
          value={this.state.pc}
          step={1}
          onChange={this.handleRange}
        />
      </div>
    )
  }
}
