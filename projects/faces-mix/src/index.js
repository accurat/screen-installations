import React from 'react'
import ReactDOM from 'react-dom'
import { PcProgression } from './components/PcProgression'
import { Slider } from './components/Slider'
import { App } from './components/App'
import 'modern-normalize'
import '@accurat/tachyons-lite'
import 'tachyons-extra'
import './reset.css'
import './style.css'

function getCurrentComponent() {
  const { pathname } = window.location
  if (pathname.includes('progression')) return PcProgression
  if (pathname.includes('slider')) return Slider
  return App
}

function renderApp() {
  const CurrentComponent = getCurrentComponent()
  ReactDOM.render(<CurrentComponent />, document.getElementById('root'))
}

// First render
renderApp()

// Hot module reloading
if (module.hot) {
  module.hot.accept('components/App', () => {
    console.clear()
    renderApp()
  })
}
