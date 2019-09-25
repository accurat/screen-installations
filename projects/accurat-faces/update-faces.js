const url = require('url')
const path = require('path')
const fs = require('fs-extra')
const got = require('got')
const chalk = require('chalk')

const { JSDOM } = require('jsdom')

const ABOUT_PAGE_URL = 'https://www.accurat.it/about/'
const PUBLIC_PATH = path.resolve(__dirname, './public')
const OUTPUT_DIRECTORY = path.resolve(PUBLIC_PATH, './images/team')
const IMAGES_JSON_PATH = path.resolve(__dirname, './src/images.json')

;(async () => {
  const { body: html } = await got(ABOUT_PAGE_URL)

  const { document } = new JSDOM(html).window

  const images = [...document.querySelectorAll('img[src*="team"]')]
  const imagesRelativeUrls = images.map(img => img.src)
  const imageUrls = imagesRelativeUrls.map(u => url.resolve(ABOUT_PAGE_URL, u))
  const fileNames = imageUrls.map(u => path.basename(url.parse(u).pathname))

  fs.emptyDir(OUTPUT_DIRECTORY)
  await Promise.all(
    imageUrls.map(async (imageUrl, i) => {
      const { body: imageBuffer } = await got(imageUrl, { encoding: null })

      const fileName = fileNames[i]
      console.log(`💾  Downloading ${chalk.dim(fileName)}`)

      fs.writeFileSync(path.resolve(OUTPUT_DIRECTORY, fileName), imageBuffer, 'binary')
    })
  )

  const publicRelativePaths = fileNames.map(fileName =>
    path.relative(PUBLIC_PATH, path.resolve(OUTPUT_DIRECTORY, fileName))
  )
  console.log(`📋  Writing images.json`)
  fs.writeFileSync(IMAGES_JSON_PATH, JSON.stringify(publicRelativePaths), 'utf-8')
})()
