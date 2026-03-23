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
import API from "./APIContext"
// import Records from "./RecordsContext"
import I18n from "./I18nContext"
import Modules from "./ModulesContext"
import moduleLoaders from '../moduleLoaders'


// Asynchronous import for context modules
const importProvidersAndContexts = async (paths) => {
  const modules = []

  for (const path of paths) {
    const loader = moduleLoaders[path]
    if (!loader) {
      throw new Error(`Context not found at ${path}`)
    }
    const module = await loader()
    modules.push(module.default)
  }

  return modules
}



// Context to manage dynamic provider registration
const DynamicProviderContext = createContext(null)



// Root Provider to wrap around the game components
export const Provider = ({ children }) => {
  const [ providers, setProviders ] = useState(() => [
    API,
    // Records,
    I18n,
    Modules
  ])
  const [ error, setError ] = useState(null)
  
  

 /**
   * Allow consumer modules to request that the Contexts they
   * require are available. The necessary Providers will be
   * inserted at the innermost end of the Provider component tree.
   */
  const insertProviders = useCallback(async (paths) => {
    if (!Array.isArray(paths)) {
      paths = [ paths ]
    }

    // Remove any obviously invalid paths
    paths = paths.filter( path => typeof path === "string" )

    try {
      const imported = await importProvidersAndContexts(paths)
      // [{ label, Context, Provider }, ...]

      // Remove any providers which are already in the tree
      const newProviders = imported.filter(
        ({ label: labelToInsert }) => (
          !providers.find(
            ({ label }) => labelToInsert === label
          )
        )
      )

      // Add the newProviders at the end of the providers array
      if (newProviders.length) {
        setProviders( current => [ ...current, ...newProviders ])
      }

      return 0

    } catch (error) {
      return error.message
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


export const useInsertProviders = () => {
  const { insertProviders } = useDynamicContexts()

  return insertProviders
}