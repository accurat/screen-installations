import React from 'react'
import queryString from 'query-string'
import { range, sampleSize, shuffle, pull } from 'lodash-es'
import delay from 'delay'
import pEvent from 'p-event'
import { mapRange } from 'canvas-sketch-util/math'
import imagesUrl from '../images.json'
import { quadIn } from 'eases'

const { slices } = queryString.parse(location.search)

const SLICES = slices || 3
const ROW_IMAGES = 20 // must be at least 12

// unit of the timings is senconds
const MAX_START_DELAY = 0.5
const ACCELETATION_TIME = 1
const SHUFFLING_TIME = 4 // 5
const DECELETATION_TIME = 1
const STOP_SHUFFLE_OFFSET = 1
const STATIC_TIME = 10

// TODO capitalizeee?? no
const minTransform = 100 / ROW_IMAGES
const maxTransform = (100 / ROW_IMAGES) * (ROW_IMAGES - 2)
const initialTransform = minTransform
// TODO maybe donìt make it related to
const TOP_VELOCITY = window.innerWidth * 0.001

export class App extends React.Component {
  tStart = Array(SLICES).fill()
  positions = Array(SLICES).fill(0)
  velocities = Array(SLICES).fill(0)
  stopDelay = Array(SLICES).fill(0)
  targetPositions = Array(SLICES).fill(0)
  lastPositions = Array(SLICES).fill(0)
  // can't contain a number < 1 and > (ROW_IMAGES - 1) - 1
  currentIndexes = Array(SLICES).fill(1)
  state = {
    pools: this.generateNewImages,
  }

  async componentDidMount() {
    // wait for all the images to load
    const images = [...document.querySelectorAll('img')]
    await Promise.all(images.map(image => pEvent(image, 'load')))

    this.startShuffle()
  }

  startShuffle = () => {
    // reset everything
    const imageWidth = 100 / ROW_IMAGES
    this.positions.map((p, i) => (this.currentIndexes[i] - 1) * imageWidth)
    this.velocities.fill(0)
    this.stopDelay.fill(0)
    this.targetPositions.fill(0)
    this.lastPositions.fill(0)

    range(0, SLICES).forEach(async i => {
      // start them with each their own offset
      await delay(Math.random() * MAX_START_DELAY * 1000)

      this.tStart[i] = performance.now()
      requestAnimationFrame(() => this.updateRow(i))
    })
  }

  updateRow = i => {
    const ms = performance.now()
    const t = Math.max(ms - this.tStart[i], 0) / 1000

    const row = [...document.querySelectorAll('.js_row')][i]
    const rowBlurred = row.querySelector('.js_row-blurred')

    const inTrigger = ACCELETATION_TIME
    const outTrigger = inTrigger + SHUFFLING_TIME + STOP_SHUFFLE_OFFSET * i + this.stopDelay[i]

    if (t < inTrigger) {
      // ease in to velocity
      const easedTime = quadIn(mapRange(t, 0, ACCELETATION_TIME, 0, 1))
      this.velocities[i] = mapRange(easedTime, 0, 1, 0, TOP_VELOCITY)
    } else if (t < outTrigger) {
      this.velocities[i] = TOP_VELOCITY
    } else {
      // wait until it's close to the target and then easeOutBack
      if (!this.stopDelay[i]) {
        const imageWidth = 100 / ROW_IMAGES
        const nextPosition = Math.ceil(this.positions[i] / imageWidth) * imageWidth
        const nextIndex = (nextPosition / imageWidth) % ROW_IMAGES

        let index = nextIndex
        let offset = 0
        const minPosition = ((t + DECELETATION_TIME) * this.positions[i]) / t
        this.targetPositions[i] = nextPosition + imageWidth * offset

        // don't stop if it's the first image, last image, same image,
        // or there is no space for the slow down transition
        while (
          index < 1 ||
          index > ROW_IMAGES - 1 - 1 ||
          index === this.currentIndexes[i] ||
          this.targetPositions[i] < minPosition
        ) {
          index = (index + 1) % ROW_IMAGES
          offset++
          this.targetPositions[i] = nextPosition + imageWidth * offset
        }

        this.currentIndexes[i] = index

        this.stopDelay[i] =
          (t * this.targetPositions[i]) / this.positions[i] - DECELETATION_TIME - outTrigger
        this.lastPositions[i] = this.positions[i]
        if (this.stopDelay[i] < 0) {
          console.error('WHAT??? WHAT DID YOU DO?? HOW DID YOU GET HERE???')
        }
      } else {
        // TODO AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
        // const easedTime = mapRange(t, outTrigger, targetTime, 1, 0)
        // this.velocities[i] = mapRange(easedTime, 1, 0, TOP_VELOCITY, 0, true)

        this.velocities[i] = 0
      }
    }

    this.positions[i] += this.velocities[i]
    // if (this.targetPositions[i] !== 0 && this.positions[i] > this.targetPositions[i]) {
    if (this.velocities[i] === 0) {
      this.positions[i] = this.targetPositions[i]

      // make it go from initialTransform to maxTransform
      const transform = initialTransform + (this.positions[i] % (maxTransform - initialTransform))
      row.style.transform = `translateX(-${transform}%)`
      // rowBlurred.style.opacity = this.velocities[i] / TOP_VELOCITY
      if (i === SLICES - 1) this.stopShuffle()
      return
    }

    // make it go from initialTransform to maxTransform
    const transform = initialTransform + (this.positions[i] % (maxTransform - initialTransform))
    row.style.transform = `translateX(-${transform}%)`
    // rowBlurred.style.opacity = this.velocities[i] / TOP_VELOCITY
    requestAnimationFrame(() => this.updateRow(i))
  }

  stopShuffle = () => {
    setTimeout(() => {
      // this.setState({ pools: this.generateNewImages })
    }, 1000)
    setTimeout(this.startShuffle, STATIC_TIME * 1000)
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
          pool[this.currentIndexes[i] - 1],
          pool[this.currentIndexes[i]],
          pool[this.currentIndexes[i] + 1]
        )

        return pool.map((image, j) => {
          if (Math.abs(j - this.currentIndexes[i]) < 2) {
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
              <feGaussianBlur in="SourceGraphic" stdDeviation="50,0" />
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
                  transform: `translateX(-${(100 / ROW_IMAGES) * this.currentIndexes[i]}%)`,
                  clipPath,
                  WebkitClipPath: clipPath,
                }}
              >
                {pool.map((image, j) => (
                  <img key={j} src={image} className="flex-none h-100" />
                ))}

                {/* <div
                  className="js_row-blurred o-0 absolute absolute--fill flex"
                  style={{ filter: 'url(#blur)' }}
                >
                  {pool.map((image, j) => (
                    <img key={j} src={image} className="flex-none h-100" />
                  ))}
                </div> */}
              </div>
            )
          })}
          <div className="absolute top-0 bottom-0 left-100 vw-50 bg-gray-dark o-70" />
          <div className="absolute top-0 bottom-0 right-100 vw-50 bg-gray-dark o-70" />
        </div>
        <div className="mt4 white" style={{ fontSize: '8vw' }}>
          Accurato
        </div>
      </div>
    )
  }
}
