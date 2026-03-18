/**
 * src/routes/Router.jsx
 */


import { useState, useEffect } from 'react'
import { 
  Routes,
  Route
} from 'react-router-dom'
import staticRoutes from '../assets/static-routes.json' with { type: "json"}
import dynamicRoutes from '../assets/dynamic-routes.json' with { type: "json"}
import components from '../pages'
import NotAvailable from '../pages/NotAvailable'

import { getContextValues } from '../state'
import { RouteWrapper } from './RouteWrapper'


const getRoute = ({ route, component, Component }) => {
  if (!Component) {
    Component = components[component]
  }

  return <Route
    key={route}
    path={route}
    element={
      <Component />
    }
  />
}


export const Routing = () => {
  const [ routeMap, setRouteMap ] = useState(staticRoutes)
  const notFound = {
    label: "Not Available",
    route: "*",
    Component: NotAvailable
  }

  
  const {
    modulesAvailable,
    setRouteAndLabel
  } = getContextValues("ModulesContext")

  let routes = routeMap.map( routeData => getRoute(routeData))

  const more = dynamicRoutes.map( moduleData => {
    const { route } = moduleData // path, label

    return (
      <Route
        key={route}
        path={route}
        element={
          <RouteWrapper
            {...moduleData}
            setRouteAndLabel={setRouteAndLabel}
          />
        }
      />
    )
  })
  routes = [...routes, ...more]



  // <<< HACK
  // The NotAvailable component will be shown momentarily if the
  // user starts a visit with a dynamic route. The dynamic route
  // should be shown as soon as it becomes available.
  //
  // NotAvailable will also be shown if
  // * The user previously visited a broken link,
  // * Navigated somewhere else
  // * Visited the broken link again
  // * Chose to delete the broken link
  // * Used the browser's Back button to return to the previously
  //   visited route.
  // 
  // In this case, NotAvailable will show a message that the
  // broken link is not currently available, and a recommendation
  // to choose a different activity.
  //
  // This is not an ideal solution, but it is impossible to remove
  // an item from window.history, and it's better to show a message
  // than an inexplicably empty page.

  routes.push(getRoute(notFound))
  // HACK >>>


  return <Routes>{routes}</Routes>
}