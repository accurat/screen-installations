import React from 'react'
import * as math from 'mathjs'

export class App extends React.Component {
  state = { coefficients: [] }
  canvas = React.createRef()

  componentDidMount() {
    window
      .fetch('./rotated.json')
      .then(r => r.json())
      .then(data => {
        const coefficients = data.people['stefania_guerra']
        this.setState({ ...data, coefficients }, () => this.draw())
      })
  }

  get coefficientCouples() {}

  draw = () => {
    const ctx = this.canvas.current.getContext('2d')
    this.canvas.current.width = this.state.shape[1]
    this.canvas.current.style.width = `${this.state.shape[1] * 2}px`
    this.canvas.current.height = this.state.shape[0]
    this.canvas.current.style.height = `${this.state.shape[0] * 2}px`
    const { coeffs, coefficients, means, shape } = this.state
    const first = math.multiply(coefficients, coeffs)
    const summed = math.add(first, means)
    const imgData = ctx.createImageData(shape[1], shape[0]) // width x height

    for (const pixelIdx in summed) {
      imgData.data[pixelIdx * 4] = summed[pixelIdx] * 255
      imgData.data[pixelIdx * 4 + 1] = summed[pixelIdx] * 255
      imgData.data[pixelIdx * 4 + 2] = summed[pixelIdx] * 255
      imgData.data[pixelIdx * 4 + 3] = 255
    }

    ctx.putImageData(imgData, 0, 0)
  }

  handleRange = idx => e => {
    const { coefficients } = this.state
    coefficients[idx] = e.target.value
    this.setState({ coefficients }, () => window.requestAnimationFrame(() => this.draw()))
  }

  render() {
    return (
      <div className="w-100 h-100 flex flex-column items-center">
        <canvas ref={this.canvas} className="o-90" />
        {this.state.coefficients.map((v, idx) => (
          <input
            className="db w-80"
            key={idx}
            type="range"
            min={-10}
            max={10}
            value={v}
            step={0.01}
            onChange={this.handleRange(idx)}
          />
        ))}
      </div>
    )
  }
}
