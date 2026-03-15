/**
 * frontend/src/modules/GameWrapper.jsx
 */


import { useState, useEffect, Suspense } from 'react'
import { getLazyModule } from '../routes/RouteWrapper'
import { throbber } from '../component/Throbber'


export default function GameWrapper(props) {
  const { children } = props
  const [ lazyModules, setLazyModules ] = useState({})


  const loadChildren = () => {
    children.forEach(({ label, path }) => {
      const Module = getLazyModule(path)

      if (Module) {
        setLazyModules(current => {
          if (!current[label]) {
            current[label] = (
              <Module
                key={label}
                label={label}
                {...props}
              />
            )
          }

          return { ...current }
        })
      }

    })
  }


  useEffect(loadChildren, [children])


  return (
    <>
      <h1>Scores</h1>
      <Suspense fallback={throbber}>
        {Object.values(lazyModules)}
      </Suspense>
    </>
  )
}