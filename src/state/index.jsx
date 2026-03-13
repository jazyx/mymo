/**
 * src/state/index.jsx
 */

import {
  createContext,
  useState,
  useMemo,
  useCallback,
  useContext,
} from 'react'
import Modules from "./ModulesContext"


// Asynchronous import for context modules
const importProvidersAndContexts = async (paths) => {
  const modules = []

  for (const path of paths) {
    const label = path.replace(/^.*\/|Context.jsx?$/gi, '')
    const contextLabel = `${label}Context`
    const providerLabel = `${label}Provider`

    const module = await import(path)
    const Context = module[contextLabel]
    const Provider = module[providerLabel]

    modules.push({ label, Context, Provider })
  }

  return modules
}



// Context to manage dynamic provider registration
const DynamicProviderContext = createContext(null)



// Root Provider to wrap around the game components
export const Provider = ({ children }) => {
  const [ providers, setProviders ] = useState(() => [
    Modules
  ])
  


 /**
   * Allow consumer modules to request that the Contexts they
   * require are available. The necessary Providers will be
   * inserted at the innermost end of the Provider component tree.
   */
  const insertProviders = useCallback(async (paths) => {
    if (!Array.isArray(paths)) {
      paths = [ paths ]
    }

    // Remove any obviously invalid paths, and ensure that they
    // all use the 'js' extension
    paths = paths
      .filter( path => typeof path === "string" )
      .map( path => path.replace(/x$/, ""))

    const imported = await importProvidersAndContexts(paths)
    // { label, Context, Provider }

    // Remove any providers which are already in the tree
    const newProviders = imported.filter(
      ({ label: labelToInsert }) => {
        const exists = providers.find(
          ({ label }) => (
            labelToInsert === label
          )
        )
        return !exists
      }
    )

    // Add the newProviders at the end of the providers array
    if (newProviders.length) {
      setProviders( current => [ ...current, ...newProviders ])
    }
  }, [providers])


  /** 
   * Build a nested provider tree, from the inside out
   *  - stable
   *  - preserves existing provider state
   */
  const providerTree = useMemo(() => {
    if (providers.length) {
      return providers.reduceRight(
        (Inner, { Provider }) => (
          <Provider>{Inner}</Provider>
        ),
        children
      )

    } else {
      return children
    }
  }, [providers, children])


  /**
  * Create a map of contexts for consumer access with the
  * format:
  * 
  * { "<label>Context": LabelContext, ... }
  */
  const contexts = useMemo(() => {
    return providers.reduce(( map, { label, Context }) => {
      map[`${label}Context`] = Context
      return map
    }, {})
  }, [providers])


  // Make insertProvider and all contexts available to consumers
  const value = useMemo(() => {
    return {
      insertProviders,
      contexts,
    }
  }, [insertProviders, contexts])


  return (
    <DynamicProviderContext.Provider value={value}>
      {providerTree}
    </DynamicProviderContext.Provider>
  )
}



// Custom hook for consumers to access dynamic contexts
export const useDynamicContexts = () => {
  const value = useContext(DynamicProviderContext)
  if (!value) {
    throw new Error('useDynamicContexts must be used inside Provider')
  }
  return value
}


export const getContextValues = contextName => {
  const { contexts } = useDynamicContexts()
  const context = contexts[contextName]
  if (!context) {
    return {}
  }

  return useContext(context)
}