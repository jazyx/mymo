/**
 * src/routes/RouteWrapper.jsx
 */


import { useState, useEffect, lazy, Suspense } from 'react'
import moduleLoaders from '../moduleLoaders'
import { throbber, Throbber } from '../component/Throbber'


const lazyCache = new Map()


// Don't reload a module if it is already cached
function getLazyModule(path) {
  let Module = lazyCache.get(path)

  if (!Module) {
    const loader = moduleLoaders[path] // () => import("...")

    if (!loader) {
      // throw error with explicit message for ErrorBoundary
      throw new Error(`loader missing for ${path}`)
    }

    const importer = 
      loader()
      .catch(error => {
        // Remove from cache so future attempts can retry
        console.error(error)
        lazyCache.delete(path)
        throw error
      })

    Module = lazy(() => importer)

    lazyCache.set(path, Module)
  }

  return Module
}


export const RouteWrapper = (props) => {
  const { path, setRouteAndLabel } = props // + label, route
  const [ LazyModule, setLazyModule ] = useState(
    () => () => <Throbber />
  )
  
  const loadModule = () => {
    setRouteAndLabel(props)
    const Module = getLazyModule(path)

    if (Module) {
      setLazyModule(Module)
    }
  }

  
  useEffect(loadModule, [path])


  return (
    <Suspense fallback={throbber}>
      <LazyModule {...props} />
    </Suspense>
  )
}