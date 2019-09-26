import React from 'react'
import ReactDOM from 'react-dom'
import { App } from './components/App'
import 'modern-normalize'
import '@accurat/tachyons-lite'
import 'tachyons-extra'
import './reset.css'
import './style.css'

window.DEBUG = window.location.search.includes('debug')

ReactDOM.render(<App />, document.getElementById('root'))
