import React from 'react'
import queryString from 'query-string'
import { range, sampleSize, shuffle, pull } from 'lodash-es'
import delay from 'delay'
import { mapRange } from 'canvas-sketch-util/math'
import imagesUrl from '../images.json'
import { quadIn } from 'eases'

const { slices } = queryString.parse(location.search)

const SLICES = slices || 3
const ROW_IMAGES = 20 // must be at least 12

// unit of the timings is senconds
const MAX_START_DELAY = 1
const ACCELETATION_TIME = 1
const SHUFFLING_TIME = 5
const DECCELETATION_TIME = 1
const STOP_SHUFFLE_OFFSET = 2

// can't contain a number < 4 and > (ROW_IMAGES - 1) - 4
// const currentPositions = [4, 8, 15]
const currentPositions = [1, 1, 1]

const minTransform = 100 / ROW_IMAGES
const maxTransform = (100 / ROW_IMAGES) * (ROW_IMAGES - 2)
const initialTransform = minTransform
const velocity = 10

export class App extends React.Component {
  tStart = []
  tStartShuffle
  state = {
    pools: this.generateNewImages,
  }

  componentDidMount() {
    setTimeout(this.startShuffle, 3000)
  }

  startShuffle = () => {
    this.tStartShuffle = performance.now()
    range(0, SLICES).forEach(async i => {
      // start them with each their own offset
      await delay(Math.random() * MAX_START_DELAY * 1000)
      this.tStart[i] = performance.now()
      requestAnimationFrame(() => this.updateRow(i))
    })
  }

  updateRow = i => {
    const ms = performance.now()
    let t = Math.max(ms - this.tStart[i], 0) / 1000

    const row = [...document.querySelectorAll('.js_row')][i]

    // goes from 0 to n
    let newTransform
    if (t < ACCELETATION_TIME) {
      // ease in to velocity
      const targetTransform = ACCELETATION_TIME * velocity
      const easedTime = quadIn(mapRange(t, 0, ACCELETATION_TIME, 0, 1))
      newTransform = mapRange(easedTime, 0, 1, 0, targetTransform)
    } else if (t < SHUFFLING_TIME + STOP_SHUFFLE_OFFSET * i) {
      newTransform = t * velocity
    } else {
      // wait until it's close to the targetTransform and then easeOutBack
    }

    // goes from initialTransform to maxTransform
    const normalizedTransform =
      initialTransform + (newTransform % (maxTransform - initialTransform))
    row.style.transform = `translateX(-${normalizedTransform}%)`

    requestAnimationFrame(() => this.updateRow(i))
  }

  get generateNewImages() {
    if (window.DEBUG) console.log('👨‍👩‍👧‍👦  UPDATE')

    let newPools

    // if it's the first time
    if (!this.state) {
      newPools = range(0, SLICES).map(() => sampleSize(imagesUrl, ROW_IMAGES))
    } else {
      // otherwise update only the non-visible images
      const { pools } = this.state
      newPools = pools.map((pool, i) => {
        const availableImages = pull(
          shuffle(imagesUrl),
          pool[currentPositions[i] - 1],
          pool[currentPositions[i]],
          pool[currentPositions[i] + 1]
        )

        return pool.map((image, j) => {
          if (Math.abs(j - currentPositions[i]) < 2) {
            return image
          }

          const newImage = availableImages.pop()
          return newImage
        })
      })
    }

    // make sure that the start and end are the same
    newPools.forEach(pool => {
      pool[ROW_IMAGES - 3] = pool[0]
      pool[ROW_IMAGES - 2] = pool[1]
      pool[ROW_IMAGES - 1] = pool[2]
    })

    return newPools
  }

  computeClipPath = i => {
    const step = 100 / SLICES
    const start = step * i
    const finish = step * (i + 1)

    const path = `0% ${start}%, 100% ${start}%, 100% ${finish}%, 0% ${finish}%`

    return `polygon(${path})`
  }

  render() {
    const { pools } = this.state

    return (
      <div className="vh-100 overflow-hidden flex flex-column flex-center">
        <svg className="dn">
          <defs>
            <filter id="blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="100,0" />
            </filter>
          </defs>
        </svg>

        <div className="flex-none relative">
          {/* this image gives the dimensions to the parent */}
          <img src={imagesUrl[0]} className="vw-80 o-0" />
          {pools.map((pool, i) => {
            const clipPath = this.computeClipPath(i)
            return (
              <div
                key={i}
                className="js_row absolute top-0 left-0 bottom-0 will-change-transform flex"
                style={{
                  width: `calc(100% * ${ROW_IMAGES})`,
                  transform: `translateX(-${(100 / ROW_IMAGES) * currentPositions[i]}%)`,
                  clipPath,
                  WebkitClipPath: clipPath,
                }}
              >
                {pool.map((image, j) => (
                  <img key={j} src={image} className="flex-none h-100" />
                ))}

                <div
                  className="js_row-blurred o-0 absolute absolute--fill flex"
                  style={{ filter: 'url(#blur)' }}
                >
                  {pool.map((image, j) => (
                    <img key={j} src={image} className="flex-none h-100" />
                  ))}
                </div>
              </div>
            )
          })}
          <div className="absolute top-0 bottom-0 left-100 vw-50 bg-gray-dark o-50" />
          <div className="absolute top-0 bottom-0 right-100 vw-50 bg-gray-dark o-50" />
        </div>
        <div className="mt4 white" style={{ fontSize: '8vw' }}>
          Accurato
        </div>
      </div>
    )
  }
}
