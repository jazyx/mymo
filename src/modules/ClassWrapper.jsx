/**
 * frontend/src/modules/GameWrapper.jsx
 */


import { useState, useEffect, Suspense } from 'react'
import { getContextValues, useInsertProviders } from '../state'
import { getLazyModule } from '../routes/RouteWrapper'
import { throbber } from '../component/Throbber'


const CONTEXTS = ['./state/dynamic/ClassContext.jsx']


export default function GameWrapper(props) {
  const insertProviders = useInsertProviders()
  // ClassContext will only become accessible after useEffect
  // has run after the component is mounted.
  const [ error, setError ] = useState(0)
  const { children=[] } = props
  const [ lazyModules, setLazyModules ] = useState({})
  const {
    classMembers,
    setClassMembers,
    activity,
    setActivity,
    scores,
    setScores,
  } = getContextValues("ClassContext")
  
  
  const loadContexts = () => {
    const insertContexts = async () => {
      // React can't intercept an error that occurs in an async
      // function, so we have to catch it here and throw it during
      // the render process
      const error = await insertProviders(CONTEXTS)
      setError(error)
    }
    insertContexts()
  }


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


  useEffect(loadContexts, [])
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