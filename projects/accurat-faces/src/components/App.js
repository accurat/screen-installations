import React from 'react'
import { range, debounce, shuffle, cloneDeep, uniq } from 'lodash-es'
import imagesUrl from '../images.json'

window.DEBUG = window.location.search.includes('debug')

const RATIO = 800 / 1000
const FRACTIONS = 1
const OVERLAPPING_TIME = window.DEBUG ? 2000 : 20000
const OVERLAPPING_TRANSITION_TIME_IN = 1000
const OVERLAPPING_TRANSITION_TIME_OUT = 500
const IMAGE_OPACITY_TRANSITION_PERCENTAGE_IN = 0.1
const IMAGE_OPACITY_TRANSITION_PERCENTAGE_OUT = 0.25
const SHUFFLE_SINGLE_TIME = 200

// TODO use transitionend and remove this delay
const SAFE_DELAY = 500

export class App extends React.Component {
  images = []
  state = {
    columns: this.optimalColumns,
    sorting: range(0, imagesUrl.length),
  }

  componentDidMount() {
    setTimeout(
      () => {
        this.images = [...document.querySelectorAll('.js_image-container')]
        this.startImages = [...this.images]
        this.positions = this.images.map(image =>
          JSON.parse(JSON.stringify(image.getBoundingClientRect()))
        )
        this.startPositions = cloneDeep(this.positions)

        window.addEventListener('resize', this.resize)
        // TODO use transitionend and promises
        this.overlapFaces()
        this.overlapInterval = setInterval(
          this.overlapFaces,
          OVERLAPPING_TRANSITION_TIME_IN +
            OVERLAPPING_TRANSITION_TIME_OUT +
            OVERLAPPING_TIME +
            SHUFFLE_SINGLE_TIME * this.images.length +
            SAFE_DELAY * 2
        )

        setTimeout(() => {
          this.shuffle()
          this.shuffleInterval = setInterval(
            this.shuffle,
            OVERLAPPING_TRANSITION_TIME_IN +
              OVERLAPPING_TRANSITION_TIME_OUT +
              OVERLAPPING_TIME +
              SHUFFLE_SINGLE_TIME * this.images.length +
              SAFE_DELAY * 2
          )
        }, OVERLAPPING_TRANSITION_TIME_IN + OVERLAPPING_TRANSITION_TIME_OUT + OVERLAPPING_TIME + SAFE_DELAY)
      },
      window.DEBUG ? 1000 : 10000
    )
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
    if (this.overlapInterval) clearInterval(this.overlapInterval)
    if (this.shuffleInterval) clearInterval(this.shuffleInterval)
  }

  resize = debounce(() => {
    this.positions = this.images.map(image => image.getBoundingClientRect())

    const columns = this.optimalColumns
    this.setState({ columns })
  }, 30)

  get VERTICAL_SPACING() {
    return window.innerHeight * 0.1
  }

  get HORIZONTAL_SPACING() {
    return window.innerWidth * 0.2
  }

  get optimalColumns() {
    let columns = 0
    let imagesHeight = 0
    do {
      columns++

      const imageWidth = (window.innerWidth - this.HORIZONTAL_SPACING) / columns
      const imageHeight = imageWidth * (1 / RATIO)
      imagesHeight = imageHeight * Math.ceil(imagesUrl.length / columns) + this.VERTICAL_SPACING
    } while (imagesHeight > window.innerHeight)

    return columns
  }

  get orderedImagesUrl() {
    const { sorting } = this.state
    return sorting.map(i => imagesUrl[i])
  }

  shuffle = () => {
    if (window.DEBUG) console.log('🌀 SHUFFLE')

    const { sorting } = this.state
    this.previousSorting = cloneDeep(sorting)
    const newSorting = shuffle(sorting)
    this.images = newSorting.map(n => this.startImages[n])
    this.setState({ sorting: newSorting })
  }

  componentDidUpdate(prevProps, prevState) {
    const { sorting } = this.state

    if (prevState.sorting !== sorting) {
      this.animateShuffle()
    }
  }

  animateShuffle = () => {
    const { sorting } = this.state

    // get the previous positions
    const previousPositions = this.images.map((image, i) => {
      const previousIndex = this.previousSorting.indexOf(sorting[i])
      const previousPosition = cloneDeep(this.positions[previousIndex])
      return previousPosition
    })

    // put the images in their previous position
    this.images.forEach((image, i) => {
      const { top, left } = this.positions[i]
      const { top: previousTop, left: previousLeft } = previousPositions[i]

      image.style.transition = null
      image.style.transform = `translate3d(${previousLeft - left}px, ${previousTop - top}px, 0)`
    })

    // sort the array so they go after one other
    let lastIndex = 0
    const toBeSorted = cloneDeep(this.previousSorting)
    const sequentialSorting = uniq(
      sorting.reduce(acc => {
        let imageSorting = this.previousSorting[lastIndex]
        if (acc.includes(imageSorting)) {
          imageSorting = toBeSorted[0]
        }

        const nextIndex = sorting.indexOf(imageSorting)

        acc.push(imageSorting)
        toBeSorted.splice(toBeSorted.indexOf(imageSorting), 1)

        lastIndex = nextIndex
        return acc
      }, [])
    )

    // do the transition
    setTimeout(() => {
      this.images.forEach(image => {
        // easeInOutQuad
        image.style.transition = `all ${SHUFFLE_SINGLE_TIME}ms cubic-bezier(0.455, 0.03, 0.515, 0.955)`
        image.style.transform = null
      })

      const orderedImages = sequentialSorting.map(n => this.startImages[n])
      orderedImages.forEach((image, i) => {
        const delay = i * SHUFFLE_SINGLE_TIME

        image.style.transitionDelay = `${delay}ms`
        setTimeout(() => {
          image.style.zIndex = i + 1
        }, delay)
      })

      setTimeout(() => {
        this.images.forEach(image => {
          image.style.zIndex = null
        })
      }, this.images.length * SHUFFLE_SINGLE_TIME)

      // 16 because 0 sometimes does no transition
    }, 16)
  }

  overlapFaces = () => {
    if (window.DEBUG) console.log('👨‍💼 OVERLAP')

    this.images.forEach((image, i) => {
      // easeOutExpo
      image.style.transition = `all ${OVERLAPPING_TRANSITION_TIME_IN}ms cubic-bezier(0.19, 1, 0.22, 1)`

      const { left, width } = this.positions[i]

      const translateX = window.innerWidth / 2 - left - width / 2

      image.style.transform = `translate3d(${translateX}px, 0, 0)`

      // hide the full image
      const fullImage = image.querySelector('.js_image-full')
      fullImage.style.transition = `all ${OVERLAPPING_TRANSITION_TIME_IN *
        IMAGE_OPACITY_TRANSITION_PERCENTAGE_IN}ms ease`
      fullImage.style.opacity = 0
    })

    setTimeout(this.unOverlapFaces, OVERLAPPING_TRANSITION_TIME_IN + OVERLAPPING_TIME)
  }

  unOverlapFaces = () => {
    if (window.DEBUG) console.log('👨‍👩‍👧‍👦 UNOVERLAP')

    this.images.forEach(image => {
      // easeOutBack
      image.style.transition = `all ${OVERLAPPING_TRANSITION_TIME_OUT}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`

      image.style.transform = null

      // show the full image
      const fullImage = image.querySelector('.js_image-full')
      fullImage.style.transition = `all ${OVERLAPPING_TRANSITION_TIME_OUT *
        IMAGE_OPACITY_TRANSITION_PERCENTAGE_OUT}ms ease`
      fullImage.style.opacity = null
    })
  }

  computeClipPaths = () => {
    const { columns } = this.state

    const step = 100 / FRACTIONS / columns
    return this.orderedImagesUrl.reduce((acc, image, i) => {
      const column = i % columns
      const itemsInRow = Math.min(imagesUrl.length - Math.floor(i / columns) * columns, columns)

      const path = [...Array(Math.ceil((FRACTIONS * columns) / itemsInRow)).keys()]
        .map(j => {
          const start = step * (j * itemsInRow) + column * step
          const finish = start + step

          return `0% ${start}%, 100% ${start}%, 100% ${finish}%, 0% ${finish}%`
        })
        .join(', ')

      acc[image] = `polygon(${path})`

      return acc
    }, {})
  }

  render() {
    const { columns } = this.state
    const imageWidth = (window.innerWidth - this.HORIZONTAL_SPACING) / columns

    const clipPaths = this.computeClipPaths()

    return (
      <div
        className="vh-100 grid content-evenly justify-evenly"
        style={{
          gridTemplateColumns: range(0, columns)
            .map(() => `${imageWidth}px`)
            .join(' '),
        }}
      >
        {this.orderedImagesUrl.map(image => (
          <div key={image} className="js_image-container relative will-change-transform">
            <img
              src={image}
              width={imageWidth}
              style={{ clipPath: clipPaths[image], WebkitClipPath: clipPaths[image] }}
            />
            <img src={image} className="js_image-full absolute absolute--fill" />
          </div>
        ))}
      </div>
    )
  }
}
