/**
 * frontend/src/modules/GameWrapper.jsx
 */


import { useState, useEffect, Suspense } from 'react'
import { getLazyModule } from '../routes/RouteWrapper'
import { throbber } from '../component/Throbber'


export default function GameWrapper(props) {
  const { game_path } = props
  const [ LazyModule, setLazyModule ] = useState(
    () => () => <p>Loading...</p>
  )


  const loadModule = () => {
      const Module = getLazyModule(game_path)

      if (Module) {
        setLazyModule(Module)
      }
    }


    useEffect(loadModule, [game_path])


    return (
      <>
        <h1>Scores</h1>
        <Suspense fallback={throbber}>
          <LazyModule {...props} />
        </Suspense>
      </>
    )
  }