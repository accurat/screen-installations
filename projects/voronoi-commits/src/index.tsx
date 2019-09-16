import { stepOptimizer, optimizer } from 'voronoi-creator'
import { Delaunay, Voronoi } from 'd3-delaunay'
import { polygonCentroid } from 'd3-polygon'
import Stats from 'stats.js'
// @ts-ignore
import State from 'controls-state'
// @ts-ignore
import wrapGUI from 'controls-gui'
import SimplexNoise from 'simplex-noise'
import { paperColor } from './lib/color-utils'
import 'modern-normalize'
// import '@accurat/tachyons-lite'
// import 'tachyons-extra'
// import './reset.css'
import './style.css'
import { cloneDeep } from 'lodash-es'

const simplex = new SimplexNoise()

declare global {
  interface Window {
    DEBUG: boolean
  }
}
window.DEBUG = window.location.search.includes('debug')

const stats = new Stats()
if (window.DEBUG) {
  document.body.appendChild(stats.dom)
}

class CommitVoronoi {
  canvas = document.querySelector('canvas')
  ctx = this.canvas.getContext('2d')
  tStart = performance.now()
  voronoi: Voronoi<number[]>
  points: ArrayLike<number>
  colors: string[]
  state: any

  constructor() {
    // TODO get those from data
    const sizes = Array(20)
      .fill(0)
      .map(Math.random)

    // TODO mattiaz's generator
    const startingPoints = Array(20)
      .fill(0)
      .map(() => [Math.random(), Math.random()])
    this.colors = Array(20)
      .fill(0)
      .map(paperColor)

    // TODO keep the starting points and later do
    // target[0] = startingPoints[i] + noise(t)
    // target[1] = startingPoints[i + 1] + noise(t)
    this.voronoi = Delaunay.from(startingPoints).voronoi([0, 0, 1, 1])
    this.points = this.voronoi.delaunay.points

    this.state = State({
      relaxation: State.Slider(0.1, { min: 0, max: 1, step: 0.01 }),
      showCenters: true,
      noise: {
        enabled: true,
        amplitude: State.Slider(0.05, { min: 0, max: 0.5, step: 0.01 }),
        frequency: State.Slider(0.01, { min: 0, max: 10, step: 0.01 }),
      },
    })

    if (window.DEBUG) {
      this.state = wrapGUI(this.state)
    }

    this.resize()
    window.addEventListener('resize', this.resize)

    requestAnimationFrame(this.update)
  }

  resize = () => {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  xScale = (n: number) => {
    return n * this.canvas.width
  }

  yScale = (n: number) => {
    return n * this.canvas.height
  }

  scalePoint = (point: number[]) => {
    return [this.xScale(point[0]), this.yScale(point[1])]
  }

  scalePolygon = (polygon: number[][]) => {
    return polygon.map(this.scalePoint)
  }

  drawPoint = (point: number[], color: string) => {
    const RADIUS = 2.5

    this.ctx.beginPath()
    this.ctx.moveTo(point[0] + RADIUS, point[1])
    this.ctx.arc(point[0], point[1], RADIUS, 0, 2 * Math.PI, false)
    this.ctx.closePath()
    this.ctx.fillStyle = color
    this.ctx.fill()
  }

  drawLine = (from: number[], to: number[], color: string) => {
    const STROKE_WIDTH = 1

    this.ctx.beginPath()
    this.ctx.moveTo(from[0], from[1])
    this.ctx.lineTo(to[0], to[1])
    this.ctx.closePath()
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = STROKE_WIDTH
    this.ctx.stroke()
  }

  drawPolygon = (polygon: number[][], color: string) => {
    this.ctx.beginPath()
    this.ctx.moveTo(polygon[0][0], polygon[0][1])
    for (let i = 1; i < polygon.length; i++) {
      const point = polygon[i]
      this.ctx.lineTo(point[0], point[1])
    }
    this.ctx.closePath()
    this.ctx.fillStyle = color
    this.ctx.fill()
  }

  update = (ms: number) => {
    const t = (ms - this.tStart) / 1000
    stats.begin()

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const polygons = Array.from(this.voronoi.cellPolygons())
    // @ts-ignore
    const centroids = polygons.map(polygonCentroid)

    const EASING_FACTOR = this.state.relaxation
    const NOISE_AMPLITUDE = this.state.noise.amplitude
    const NOISE_FREQUENCY = this.state.noise.frequency
    for (let i = 0; i < this.points.length; i += 2) {
      // this is done also with bitwise operation i >> 1, but why the fuck
      const normalizedIndex = Math.floor(i / 2)

      const point = [this.points[i], this.points[i + 1]]
      const polygon = polygons[normalizedIndex]
      const centroid = centroids[normalizedIndex]

      if (!centroid) continue

      // apply LLoys's relaxation
      // https://observablehq.com/@mbostock/lloyds-algorithm
      // https://observablehq.com/@fil/spherical-lloyds-relaxation
      const target = cloneDeep(centroid)

      // give 'em a wobble
      if (this.state.noise.enabled) {
        target[0] += simplex.noise2D(i, t * NOISE_FREQUENCY) * NOISE_AMPLITUDE
        target[1] += simplex.noise2D(i + 1000, t * NOISE_FREQUENCY) * NOISE_AMPLITUDE
      }

      // ease the point to the target
      // https://aerotwist.com/tutorials/protip-stick-vs-ease/
      const x0 = point[0]
      const y0 = point[1]
      const [x1, y1] = target
      // @ts-ignore
      this.points[i] = x0 + (x1 - x0) * EASING_FACTOR
      // @ts-ignore
      this.points[i + 1] = y0 + (y1 - y0) * EASING_FACTOR

      // draw!
      if (polygon) {
        this.drawPolygon(this.scalePolygon(polygon), this.colors[normalizedIndex])
      }

      if (window.DEBUG && this.state.showCenters) {
        this.drawPoint(this.scalePoint(point), '#000')
      }

      if (target && window.DEBUG && this.state.showCenters) {
        this.drawPoint(this.scalePoint(target), '#f00')
        this.drawLine(this.scalePoint(point), this.scalePoint(target), '#000')
      }
    }

    // @ts-ignore
    this.voronoi.update()

    stats.end()
    requestAnimationFrame(this.update)
  }
}

new CommitVoronoi()
