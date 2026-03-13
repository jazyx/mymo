/**
 * src/state/ModulesContext.jsx
 *
 * description
 */


import { createContext, useState, useEffect} from 'react'
const MODULES_API = "./modules-available.json"


export const ModulesContext = createContext()


export const ModulesProvider = ({ children }) => {
  const [ modulesAvailable, setModulesAvailable ] = useState([])
  const [ badLinks, setBadLinks ] = useState([])


  const hideBadLinks = link => {
    if (badLinks.indexOf(link) < 0) {
      setBadLinks(current => [ ...current, link ])
      setModulesAvailable(current => current.filter( module => (
        module.route !== link
      )))
    }
  }


  const fetchModulesAvailable = () => {
    fetch(MODULES_API)
    .then(response => response.json())
    .then(json => setModulesAvailable(json))
  }


  useEffect(fetchModulesAvailable, [])


  return (
    <ModulesContext.Provider
      value ={{
        modulesAvailable,
        setModulesAvailable,
        hideBadLinks
      }}
    >
      {children}
    </ModulesContext.Provider>
  )
}


export const label = "Modules"