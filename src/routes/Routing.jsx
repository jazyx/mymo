/**
 * src/routes/Router.jsx
 */


import { useState, useContext } from 'react'
import { 
  Routes,
  Route
} from 'react-router-dom'
import { getContextValues } from '../state'
import { RouteWrapper } from './RouteWrapper'
import { Throbber } from '../component/Throbber'



export const Routing = (props) => {
  const {
    modulesAvailable,
    setRouteAndLabel
  } = getContextValues("ModulesContext")
  const [ boundaryError, setBoundaryError ] = useState(0)


  const resetBoundaryError = zero => {
    if (zero === 0) {
      return setBoundaryError(0)
    }

    setBoundaryError(current => current + 1)
  }


  let routes = modulesAvailable.map( moduleData => {
    const { route } = moduleData // path, label

    const props = {
      setRouteAndLabel,
      boundaryError,
      resetBoundaryError
    }

    return (
      <Route
        key={route}
        path={route}
        element={
          <RouteWrapper
            {...moduleData}
            {...props}
          />
        }
      />
    )
  })

  if (!routes.length) {
    routes = (
      <Route
        key="__loading__"
        path="/"
        element={<Throbber />}
      />
    )
  }

  return <Routes>{routes}</Routes>
}