import React from 'react'
import * as math from 'mathjs'
import { chunk } from 'lodash-es'

export class App extends React.Component {
  state = { coefficients: [], people: {} }
  canvas = React.createRef()

  componentDidMount() {
    window
      .fetch('./rotated.json')
      .then(r => r.json())
      .then(data => {
        const keys = Object.keys(data.people)
        const id = window.location.pathname.split('/')[1] || Math.round(Math.random() * keys.length)
        const coefficients = data.people[keys[id]]
        this.setState({ ...data, coefficients }, () => this.draw())
      })
  }

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

  renderCoefficientRow = (coefficients, idx) => {
    return (
      <div className="w-90 flex pb4" key={idx}>
        {coefficients.map((val, jdx) => {
          const realIdx = idx * coefficients.length + jdx
          return (
            <div className="flex-auto flex justify-around ph2" key={realIdx}>
              <label className="w3">{`PC${realIdx}`}</label>
              <input
                key={realIdx}
                type="range"
                className="w-80"
                min={-100}
                max={100}
                value={val}
                step={0.01}
                onChange={this.handleRange(realIdx)}
              />
            </div>
          )
        })}
      </div>
    )
  }

  render() {
    const coefficients = chunk(this.state.coefficients, 5)
    return (
      <div className="w-100 h-100 flex flex-column items-center">
        <canvas ref={this.canvas} className="o-90 pa3" />
        {coefficients.map(this.renderCoefficientRow)}
        {/* <select>{Object.values(this.state.people).map((v > {}))}</select> */}
      </div>
    )
  }
}
