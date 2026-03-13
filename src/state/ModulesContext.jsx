/**
 * src/state/ModulesContext.jsx
 *
 * description
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
   * Called by the button in on of the Error Fallback components.
   * Deletes the most recent entry in history, and runs setBadLinks
   * so that the goBackToSafeRoute() useEffect will be called
   * after the state variables have been updated.
   */
  const hideBadLink = () => {
    const link = history[0]?.route

    if (badLinks.indexOf(link) < 0) {
      // Remove bad route from all of history
      console.log("window.history:", window.history)
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
        return current
      }

      // Last in, first out
      return [{ route, label }, ...current, ]
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
        setModulesAvailable,
        setRouteAndLabel,
        history,
        hideBadLink
      }}
    >
      {children}
    </ModulesContext.Provider>
  )
}


export default {
  label: "Modules",
  Context: ModulesContext,
  Provider: ModulesProvider
} 