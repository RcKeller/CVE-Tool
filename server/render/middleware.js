import { createMemoryHistory, match } from 'react-router'
import createRoutes from '../../app/routes'
import configureStore from '../../app/store'
import pageRenderer from './pageRenderer'
import fetchDataForRoute from './fetchDataForRoute'

/*
 * Export render function to be used in server/config/routes.js
 * We grab the state passed in from the server and the req object from Express/Koa
 * and pass it into the Router.run function.
 */
export default function render (req, res) {
  const history = createMemoryHistory()
  const store = configureStore({}, history)
  const routes = createRoutes(store)

  /*
   * From the react-router docs:
   *
   * This function is to be used for server-side rendering. It matches a set of routes to
   * a location, without rendering, and calls a callback(err, redirect, props)
   * when it's done.
   *
   * The function will create a `history` for you, passing additional `options` to create it.
   * These options can include `basename` to control the base name for URLs, as well as the pair
   * of `parseQueryString` and `stringifyQuery` to control query string parsing and serializing.
   * You can also pass in an already instantiated `history` object, which can be constructed
   * however you like.
   *
   * The three arguments to the callback function you pass to `match` are:
   * - err:       A javascript Error object if an error occurred, `undefined` otherwise.
   * - redirect:  A `Location` object if the route is a redirect, `undefined` otherwise
   * - props:     The props you should pass to the routing context if the route matched,
   *              `undefined` otherwise.
   * If all three parameters are `undefined`, this means that there was no route found matching the
   * given location.
   */
  match({ routes, location: req.url }, (err, redirect, props) => {
    /*
    TODO: Cookies are not set (due to SSR architecture)
    this is probably why shib redirects to login/undefined
    GitHub issue (and potential solution that assumes Axios is your data fetch method):
    https://github.com/reactGo/reactGo/issues/922
    https://github.com/reactGo/reactGo/pull/937
    */
    if (err) {
      //  Patches are used to bypass 500 responses for known, non-breaking errors
      if (patchReactDataGridSelfReferenceError(err)) {
        //  BUGFIX: If "self" is not defined, reload page after a split second (error does not reoccur)
        setTimeout(() => res.redirect(req.url), 500)
      } else {
        console.error(err, redirect, props)
        res.status(500).json(err)
      }
    } else if (redirect) {
      res.redirect(302, redirect.pathname + redirect.search)
    } else if (props) {
      // This method waits for all render component
      // promises to resolve before returning to browser
      fetchDataForRoute(props)
        .then((data) => {
          const html = pageRenderer(store, props)
          res.status(200).send(html)
        })
        .catch((err) => {
          console.error(err)
          res.status(500).json(err)
        })
    } else {
      res.sendStatus(404)
    }
  })
}
