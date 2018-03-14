import { combineReducers } from 'redux'
import { routerReducer as routing } from 'react-router-redux'
import { entitiesReducer as db, queriesReducer as queries } from 'redux-query'
import {responsiveStateReducer as screen} from 'redux-responsive'

const rootReducer = combineReducers({
  //  redux-responsive (media query data in store)
  screen,
  // react-router-redux
  routing,
  //  redux-query
  //  db: Referred to as "entities" in redux-query docs, changed the namespace for readability
  db,
  queries
})

export default rootReducer
