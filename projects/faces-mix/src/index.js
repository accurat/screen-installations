import React from 'react'
import ReactDOM from 'react-dom'
import { PcProgression } from './components/PcProgression'
import { App } from './components/App'
import 'modern-normalize'
import '@accurat/tachyons-lite'
import 'tachyons-extra'
import './reset.css'
import './style.css'

function renderApp() {
  const CurrentComponent = window.location.pathname.includes('progression') ? PcProgression : App
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
