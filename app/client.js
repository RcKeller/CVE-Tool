import React from 'react'
import { hydrate } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, browserHistory, match } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import createRoutes from './routes'
import configureStore from './store'

// Grab the state from a global injected into server-generated HTML
const initialState = window.__INITIAL_STATE__

const store = configureStore(initialState, browserHistory)
const history = syncHistoryWithStore(browserHistory, store)
const routes = createRoutes(store)

/**
 * Callback function handling frontend route changes.
 */
function onUpdate () {
  /*
  Prevent duplicate fetches when first loaded.
  Explanation: On server-side render, we already have __INITIAL_STATE__
  So when the client side onUpdate kicks in, we do not need to fetch twice.
  We set it to null so that every subsequent client-side navigation will
  still trigger a fetch data.
  Read more: https://github.com/choonkending/react-webpack-node/pull/203#discussion_r60839356
  */
  if (window.__INITIAL_STATE__ !== null) { window.__INITIAL_STATE__ = null }
}

// Router converts <Route> element hierarchy to a route config:
// Read more https://github.com/rackt/react-router/blob/latest/docs/Glossary.md#routeconfig
match({routes, history}, (error, redirectLocation, renderProps) => {
  error && console.warn(error)  // BUG: errors were not handled by match
  hydrate(
    <Provider store={store}>
      <Router {...renderProps} onUpdate={onUpdate} />
    </Provider>, document.getElementById('app')
  )
})

//  Load styles ASAP, preventing FOUT
import './styles/index.scss'
