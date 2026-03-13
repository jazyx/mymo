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
 */


import { createContext, useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
const MODULES_API = "./modules-available.json"


export const ModulesContext = createContext()


export const ModulesProvider = ({ children }) => {
  const navigate = useNavigate()
  const [ modulesAvailable, setModulesAvailable ] = useState([])
  const [ badLinks, setBadLinks ] = useState([])
  const [ history, setHistory ] = useState([])


  /**
   * Called by the button in one of the Error Fallback components.
   * Deletes the most recent entry in history, and runs setBadLinks
   * so that the goBackToSafeRoute() useEffect will be called
   * after the state variables have been updated.
   */
  const hideBadLink = () => {
    const link = history[0]?.route

    if (badLinks.indexOf(link) < 0) {
      // Remove bad route from all of history
      setHistory(current => (
        current.filter( data  => data.route !== link )
      ))
      setBadLinks(current => [ ...current, link ])
      setModulesAvailable(current => current.filter( module => (
        module.route !== link
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

    const lastGoodRoute = history[0]?.route || "/"
    navigate(lastGoodRoute, { replace: true })
  }


  const fetchModulesAvailable = () => {
    fetch(MODULES_API)
    .then(response => response.json())
    .then(json => setModulesAvailable(json))
  }


  useEffect(fetchModulesAvailable, [])
  useEffect(goBackToSafeRoute, [badLinks.length])


  return (
    <ModulesContext.Provider
      value ={{
        modulesAvailable,
        setRouteAndLabel,
        history,
        hideBadLink
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