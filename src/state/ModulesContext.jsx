/**
 * src/state/ModulesContext.jsx
 *
 * Fetches a JSON file with the format:
 *
 *   [
 *     { "label": "Name to show in UI"
 *       "route": "/route-for-address-bar",
 *       "path":  "./path/to/ModuleName.jsx"
 *     }
 *   ]
 *
 * This is made avalailable to Nav and Routing as modulesAvailable,
 * where it is used to create Links and to load a module
 * dynamically when requested.
 *
 * To help with ErrorBoundary:
 *
 *  + setRouteAndLabel() allows RouteWrapper to update history.
 *    If there is an error, history[0].label can be used in the
 *    error message and history[0].route can be used to remove
 *    the associated module data from modulesAvailable.
 *  + history is an array used by ErrorBoundary, to obtain the
 *    label of the current module
 *  + hideBadLink() can be called by one of the Error Fallback
 *    components in ErrorBoundary, to remove a Link which is
 *    provoking errors
 *  + boundaryError is initially 0, but can be increment by calls
 *    to...
 *  + resetBoundaryError(). This changes the key for ErrorBoundary
 *    and so allows a module that provoked an error to be
 *    restarted. `boundaryError` is reset to 0 when the location
 *    changes, or when 
 */


import { createContext, useState, useEffect, useRef} from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
const MODULES_API = "./modules-available.json"


export const ModulesContext = createContext()


export const ModulesProvider = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [ modulesAvailable, setModulesAvailable ] = useState([])
  const [ badLinks, setBadLinks ] = useState([])
  const [ history, setHistory ] = useState([])
  const [ boundaryError, setBoundaryError ] = useState(0)
  

  const resetBoundaryError = zero => {
    if (zero === 0) {
      return setBoundaryError(0)
    }

    setBoundaryError(current => current + 1)
  }


  const clearErrorBoundary = () => {
    resetBoundaryError(0)
  }


  /**
   * Called by the button in one of the Error Fallback components.
   * Deletes the most recent entry in history, and runs setBadLinks
   * so that the goBackToSafeRoute() useEffect will be called
   * after the state variables have been updated.
   */
  const hideBadLink = () => {
    const active = history[0]

    const index = badLinks.findIndex( badLink => (
      badLink.route === active.route
    ))

    if (index < 0) {
      // Remove bad route from all of history
      setHistory(current => (
        current.filter( data  => data.route !== active.route )
      ))
      setBadLinks(current => [ ...current, active ])
      setModulesAvailable(current => current.filter( module => (
        module.route !== active.route
      )))
    }
  }


  const setRouteAndLabel = ({ route, label }) => {
    setHistory(current => {
      if (current[0] && current[0].route === route){
        // No update needed
        return current
      }

      // Last in, first out, but keep only most recent history
      current = [{ route, label }, ...current ].slice(0, 3)

      return current
    })
  }


  const goBackToSafeRoute = () => {
    if (!badLinks.length) { return }

    resetBoundaryError(0) // to ensure last good path is unblocked
    const lastGoodRoute = history[0]?.route || "/"
    navigate(lastGoodRoute, { replace: true })

    // NOTE: { replace: true } will only affect the most recent
    // visit to the route which caused the error.
    // If this route was previously visited without being deleted,
    // window.history will still contain a record for it, and
    // allow the user to return to that route using the Back and
    // Forward arrows. However, the route will no longer exist, so
    // no module will be shown.
    // Refreshing the page with the route active will reload the
    // app with the module for that route.
  }


  const fetchModulesAvailable = () => {
    fetch(MODULES_API)
    .then(response => response.json())
    .then(json => setModulesAvailable(json))
  }


  useEffect(fetchModulesAvailable, [])
  useEffect(goBackToSafeRoute, [badLinks.length])
  useEffect(clearErrorBoundary, [location])


  return (
    <ModulesContext.Provider
      value ={{
        modulesAvailable,
        setRouteAndLabel,
        history,
        boundaryError,
        resetBoundaryError,
        hideBadLink,
        badLinks
      }}
    >
      {children}
    </ModulesContext.Provider>
  )
}


// Called by state/index.jsx: all the details of this Context
// in one place
export default {
  label: "Modules",
  Context: ModulesContext,
  Provider: ModulesProvider
}