import { Delaunay } from 'd3-delaunay'
import { polygonCentroid } from 'd3-polygon'
import Stats from 'stats.js'
import State from 'controls-state'
import wrapGUI from 'controls-gui'
import SimplexNoise from 'simplex-noise'
import { cloneDeep, orderBy } from 'lodash-es'
import { weightedVoronoi } from 'd3-weighted-voronoi'
import { voronoiMapSimulation } from 'd3-voronoi-map'
import 'modern-normalize'
import seedrandom from 'seedrandom'
import { paperColor } from './lib/color-utils'
// import '@accurat/tachyons-lite'
// import 'tachyons-extra'
// import './reset.css'
import './style.css'
import { interpolate } from 'flubber'

const simplex = new SimplexNoise()

window.DEBUG = window.location.search.includes('debug')

const stats = new Stats()
if (window.DEBUG) {
  document.body.appendChild(stats.dom)
}

const POINTS = [
  [0.44565811321802135, 0.3694042437866161],
  [0.33861652211044235, 0.12155113140863932],
  [0.5361131036702566, 0.18830631408207985],
  [0.9188506474588458, 0.608750460938544],
  [0.21249613588616117, 0.2624308495284128],
  [0.10490949454605365, 0.12085460724452578],
  [0.5451037440696135, 0.8480702514511347],
  [0.30497286766099485, 0.9208756048082983],
  [0.3393970657598528, 0.6610364216143856],
  [0.1402791091770551, 0.46339769582527907],
  [0.1198781144025119, 0.8275293147957573],
  [0.0429654764935574, 0.26537313232950827],
  [0.3999640910226635, 0.9862337846610858],
  [0.8565597780717994, 0.8601254830938436],
  [0.643138067448363, 0.24808470080805123],
  [0.5744646399133831, 0.08288570843648849],
  [0.8284647875476423, 0.11048501985056847],
  [0.6690385192205609, 0.5649686887353645],
  [0.8598365863790565, 0.34893514810853277],
  [0.7266133523042462, 0.7458018720280303],
]

const WEIGHTS = [
  0.1653030508881126,
  0.7773429972387613,
  0.564999518939709,
  0.0780622091405414,
  0.7225430289417549,
  0.9539361443422358,
  0.9508310256718737,
  0.8072182880593584,
  0.664588164505624,
  0.9803871654389547,
  0.25210345551231494,
  0.4831169554357593,
  0.8957936607602162,
  0.7355563802158629,
  0.2926924321548048,
  0.05297171845358273,
  0.008606108528119494,
  0.37129346314507927,
  0.00128786146044102,
  0.013965411479851975,
]

const WEIGHTSSS = [
  30291.46428558656,
  50706.3257261289,
  43386.224123959306,
  25252.19845975309,
  51863.04698206204,
  56225.87417999514,
  55942.32321665682,
  55593.472986826455,
  43261.43592056412,
  57132.61656354171,
  29964.839623070064,
  39103.64704627544,
  58603.53504840445,
  51770.650354812205,
  30482.967864123744,
  26139.69868607728,
  26401.328308989316,
  34771.090816938944,
  18312.127535720057,
  15623.056922800832,
]

const POLYGONS = [
  [
    [0.48613008229326427, 0.18371941197493183],
    [0.25646949748162784, 0.2829041031699536],
    [0.25169961975886057, 0.2933006520425377],
    [0.319751603021021, 0.5143974031551884],
    [0.4686566523086787, 0.5686534411101678],
    [0.651741343529658, 0.35952783717684517],
    [0.5692367871821568, 0.22522963911836882],
  ],
  [
    [0.48613008229326427, 0.18371941197493183],
    [0.49788578483289747, 0.14893992411450374],
    [0.4734682689460884, 3.552713678800501e-17],
    [0.20201670670678368, 0],
    [0.20132070121051585, 0.23353299724820914],
    [0.25646949748162784, 0.2829041031699536],
  ],
  [
    [0.48613008229326427, 0.18371941197493183],
    [0.5692367871821568, 0.22522963911836882],
    [0.5926020898355405, 0.18339728453164938],
    [0.49788578483289747, 0.14893992411450374],
  ],
  [
    [0.9999999999999999, 0.4780169796291679],
    [0.8418235046553123, 0.5139449519106392],
    [0.8102966381072564, 0.6938324537802432],
    [1, 0.7408410516776271],
  ],
  [
    [0.25646949748162784, 0.2829041031699536],
    [0.20132070121051585, 0.23353299724820914],
    [0.16409629352069185, 0.26182057526707303],
    [0.25169961975886057, 0.2933006520425377],
  ],
  [
    [0.20132070121051585, 0.23353299724820914],
    [0.20201670670678368, 3.552713678800501e-17],
    [0, 1.990590354560232e-17],
    [7.105427357601002e-17, 0.20880329819188873],
    [0.13153584401559607, 0.26518263566063993],
    [0.16409629352069185, 0.26182057526707303],
  ],
  [
    [0.3490773523100181, 0.8142408153647505],
    [0.3936003326215808, 0.9610891141442396],
    [0.4306409714635512, 1],
    [0.7077829459936731, 1],
    [0.7162569846042259, 0.7810667985612321],
    [0.6948227467378019, 0.7430245401438306],
    [0.4938310315684713, 0.6550354001766892],
  ],
  [
    [0.3490773523100181, 0.8142408153647505],
    [0.2884877507587167, 0.8062137409993865],
    [0.19075819325010795, 1],
    [0.3668279152761454, 1],
    [0.3936003326215808, 0.9610891141442396],
  ],
  [
    [0.3490773523100181, 0.8142408153647505],
    [0.4938310315684713, 0.6550354001766892],
    [0.4686566523086787, 0.5686534411101678],
    [0.319751603021021, 0.5143974031551884],
    [0.17656964262614433, 0.6586510116497557],
    [0.2884877507587167, 0.8062137409993865],
  ],
  [
    [-1.7763568394002505e-17, 0.3298222469456356],
    [0, 0.6487584448719969],
    [0.17656964262614433, 0.6586510116497557],
    [0.319751603021021, 0.5143974031551884],
    [0.25169961975886057, 0.2933006520425377],
    [0.16409629352069185, 0.26182057526707303],
    [0.13153584401559607, 0.26518263566063993],
  ],
  [
    [0, 0.6487584448719969],
    [0, 1],
    [0.1907581932501079, 1],
    [0.2884877507587167, 0.8062137409993865],
    [0.17656964262614433, 0.6586510116497557],
  ],
  [
    [0, 0.3298222469456356],
    [0.13153584401559607, 0.26518263566063993],
    [-1.7763568394002505e-17, 0.20880329819188873],
  ],
  [
    [0.43064097146355107, 1],
    [0.3936003326215808, 0.9610891141442396],
    [0.36682791527614533, 1],
  ],
  [
    [0.7077829459936731, 1],
    [1, 1],
    [0.9999999999999999, 0.7408410516776271],
    [0.8102966381072564, 0.6938324537802432],
    [0.7710882083930285, 0.7187426514721964],
    [0.7162569846042259, 0.7810667985612321],
  ],
  [
    [0.5692367871821568, 0.22522963911836882],
    [0.651741343529658, 0.35952783717684517],
    [0.6656917192103652, 0.35838760590518787],
    [0.719172719930372, 0.24347236301660863],
    [0.6552367784698758, 0.15735996620811218],
    [0.5926020898355405, 0.18339728453164938],
  ],
  [
    [0.4734682689460884, -1.4210854715202004e-16],
    [0.49788578483289747, 0.14893992411450374],
    [0.5926020898355405, 0.18339728453164938],
    [0.6552367784698758, 0.15735996620811218],
    [0.6723352988917632, 0],
  ],
  [
    [1, 0],
    [0.6723352988917632, 0],
    [0.6552367784698758, 0.15735996620811218],
    [0.719172719930372, 0.24347236301660863],
    [1, 0.20652519506546996],
  ],
  [
    [0.4686566523086787, 0.5686534411101678],
    [0.4938310315684713, 0.6550354001766892],
    [0.6948227467378019, 0.7430245401438306],
    [0.7710882083930285, 0.7187426514721964],
    [0.8102966381072564, 0.6938324537802432],
    [0.8418235046553123, 0.5139449519106392],
    [0.6656917192103652, 0.35838760590518787],
    [0.651741343529658, 0.35952783717684517],
  ],
  [
    [1, 0.20652519506546996],
    [0.719172719930372, 0.24347236301660863],
    [0.6656917192103652, 0.35838760590518787],
    [0.8418235046553123, 0.5139449519106392],
    [1, 0.4780169796291679],
  ],
  [
    [0.7162569846042259, 0.7810667985612321],
    [0.7710882083930285, 0.7187426514721964],
    [0.6948227467378019, 0.7430245401438306],
  ],
]

let WHATTTT = 0

function generateWeightedVoronoi(weights, initialPositions = [], initialWeights = []) {
  const weightData = weights.map((weight, i) => ({
    index: i,
    weight,
    initialPositionX: initialPositions[i][0],
    initialPositionY: initialPositions[i][1],
    initialWeight: initialWeights[i],
  }))

  const FACTOR = 1000
  const simulation =
    initialWeights.length > 0
      ? voronoiMapSimulation(weightData)
          .clip([
            [0, 0],
            [0, FACTOR],
            [FACTOR, FACTOR],
            [FACTOR, 0],
          ])
          .initialPosition(d => [d.initialPositionX * FACTOR, d.initialPositionY * FACTOR])
          .initialWeight(d => d.initialWeight)
          .stop()
      : voronoiMapSimulation(weightData)
          .clip([
            [0, 0],
            [0, FACTOR],
            [FACTOR, FACTOR],
            [FACTOR, 0],
          ])
          .initialPosition(d => [d.initialPositionX * FACTOR, d.initialPositionY * FACTOR])
          .stop()

  let state = simulation.state()
  let MAX_ITERATIONS = WHATTTT
  while (!state.ended && MAX_ITERATIONS > 0) {
    simulation.tick()
    state = simulation.state()
    MAX_ITERATIONS--
  }

  WHATTTT++

  const polygons = orderBy(
    state.polygons,
    polygon => {
      return initialPositions.findIndex(
        pos => pos[0] === polygon.site.originalObject.data.originalData.initialPositionX
      )
    },
    'asc'
  )

  const outweights = polygons.map(p => p.site.weight)
  const points = polygons.map(polygon => [polygon.site.x, polygon.site.y])

  function scalePoint(p) {
    return p.map(n => n / FACTOR)
  }

  return [points.map(scalePoint), polygons.map(poly => poly.map(scalePoint)), outweights]
}

class CommitVoronoi {
  canvas = document.querySelector('canvas')
  ctx = this.canvas.getContext('2d')
  tStart = performance.now()
  voronoi
  points
  colors
  state
  weightss = []

  constructor() {
    // TODO get those from data
    this.weights = Array(20)
      .fill()
      .map(Math.random)

    const startingPoints = Array(20)
      .fill()
      .map(() => [Math.random(), Math.random()])
    this.colors = Array(20)
      .fill()
      .map(paperColor)

    // const [points, polygons] = generateWeightedVoronoi(WEIGHTS, POINTS)
    this.targetPoints = POINTS
    // this.polygons = polygons

    // this.targetPoints = POINTS

    // TODO keep the starting points and later do
    // target[0] = startingPoints[i] + noise(t)
    // target[1] = startingPoints[i + 1] + noise(t)
    this.voronoi = Delaunay.from(this.targetPoints).voronoi([0, 0, 1, 1])
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

  xScale = n => {
    return n * this.canvas.width
  }

  yScale = n => {
    return n * this.canvas.height
  }

  scalePoint = point => {
    return [this.xScale(point[0]), this.yScale(point[1])]
  }

  scalePolygon = polygon => {
    return polygon.map(this.scalePoint)
  }

  drawPoint = (point, color) => {
    const RADIUS = 2.5

    this.ctx.beginPath()
    this.ctx.moveTo(point[0] + RADIUS, point[1])
    this.ctx.arc(point[0], point[1], RADIUS, 0, 2 * Math.PI, false)
    this.ctx.closePath()
    this.ctx.fillStyle = color
    this.ctx.fill()
  }

  drawLine = (from, to, color) => {
    const STROKE_WIDTH = 1

    this.ctx.beginPath()
    this.ctx.moveTo(from[0], from[1])
    this.ctx.lineTo(to[0], to[1])
    this.ctx.closePath()
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = STROKE_WIDTH
    this.ctx.stroke()
  }

  drawPolygon = (polygon, color) => {
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

  update = ms => {
    const t = (ms - this.tStart) / 1000
    stats.begin()

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const [newPoints, newPolygons, newWeights] = generateWeightedVoronoi(WEIGHTS, POINTS)
    this.polygons = newPolygons
    // this.targetPoints = newPoints

    // newPoints.forEach((p, i) => {
    //   const point = this.targetPoints[i]
    //   const target = p

    //   const x0 = point[0]
    //   const y0 = point[1]
    //   const [x1, y1] = target

    //   this.targetPoints[i][0] = x0 + (x1 - x0) * 0.1
    //   this.targetPoints[i][1] = y0 + (y1 - y0) * 0.1
    // })

    // const polygons = Array.from(this.voronoi.cellPolygons())

    // these are sooo much fewer
    // const polygons = orderBy(
    //   this.weightedVoronoi(
    //     this.targetPoints.map((point, i) => ({ x: point[0], y: point[1], weight: WEIGHTS[i] }))
    //   ),
    //   polygon =>
    //     this.targetPoints.findIndex(
    //       p => p[0] === polygon.site.originalObject.x && p[1] === polygon.site.originalObject.y
    //     ),
    //   'asc'
    // )

    const centroids = this.polygons.map(polygonCentroid)

    const EASING_FACTOR = this.state.relaxation
    const NOISE_AMPLITUDE = 0.12 // this.state.noise.amplitude
    const NOISE_FREQUENCY = 2.83 // this.state.noise.frequency
    for (let i = 0; i < this.points.length; i += 2) {
      // this is done also with bitwise operation i >> 1, but why the fuck
      const normalizedIndex = Math.floor(i / 2)

      const point = [this.points[i], this.points[i + 1]]
      const pointTarget = this.targetPoints[normalizedIndex]
      const polygon = this.polygons[normalizedIndex]
      const centroid = centroids[normalizedIndex]

      if (!centroid) continue

      // apply LLoys's relaxation
      // https://observablehq.com/@mbostock/lloyds-algorithm
      // https://observablehq.com/@fil/spherical-lloyds-relaxation
      // const target = cloneDeep(centroid)
      // const target = this.targetPoints[normalizedIndex]

      // // give 'em a wobble
      // if (this.state.noise.enabled) {
      //   target[0] += simplex.noise2D(i, t * NOISE_FREQUENCY) * NOISE_AMPLITUDE
      //   target[1] += simplex.noise2D(i + 1000, t * NOISE_FREQUENCY) * NOISE_AMPLITUDE
      // }

      // ease the point to the target
      // https://aerotwist.com/tutorials/protip-stick-vs-ease/
      // const x0 = point[0]
      // const y0 = point[1]
      // const [x1, y1] = target

      // this.points[i] = x0 + (x1 - x0) * EASING_FACTOR

      // this.points[i + 1] = y0 + (y1 - y0) * EASING_FACTOR

      // this.targetPoints[normalizedIndex][0] = x0 + (x1 - x0) * EASING_FACTOR

      // this.targetPoints[normalizedIndex][1] = y0 + (y1 - y0) * EASING_FACTOR

      // draw!
      if (polygon) {
        this.drawPolygon(this.scalePolygon(polygon), this.colors[normalizedIndex])
      }

      if (true) {
        this.drawPoint(this.scalePoint(pointTarget), '#000')
        // this.drawPoint(this.scalePoint(point), '#000')
        // this.drawLine(this.scalePoint(point), this.scalePoint(target), '#000')
        // this.drawPoint(this.scalePoint(target), '#f00')
      }
    }

    this.voronoi.update()

    stats.end()

    // this.polygons = orderBy(
    //   this.weightedVoronoi(
    //     this.targetPoints.map((point, i) => ({ x: point[0], y: point[1], weight: WEIGHTS[i] }))
    //   ),
    //   polygon =>
    //     this.targetPoints.findIndex(
    //       p => p[0] === polygon.site.originalObject.x && p[1] === polygon.site.originalObject.y
    //     ),
    //   'asc'
    // )

    setTimeout(() => requestAnimationFrame(this.update), 16)
    // requestAnimationFrame(this.update)
  }
}

new CommitVoronoi()
