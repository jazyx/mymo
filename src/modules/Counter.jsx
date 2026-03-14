/**
 * src/modules/Counter.jsx
 *
 * A simple component to illustrate dynamic insertion of a Context
 * and its Provider.
 */


import { useState, useEffect } from 'react'
import { getContextValues, useInsertProviders } from '../state'
import "../css/counter.css"


// HARD-CODED link to the Context(s) required by this component.
// Contexts and Providers will be inserted dynamically on useEffect
// after the components is first mounted. They will then remain
// available permanently.
const CONTEXTS = ["./state/dynamic/CounterContext.jsx"]


export default () => {
  const insertProviders = useInsertProviders()
  // CounterContext will only become accessible after useEffect
  // has run after the component is mounted.
  const [ error, setError ] = useState(0)
  const { score, setScore } = getContextValues("CounterContext")


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


  useEffect(loadContexts, [])


  if (error) {
    throw new Error(error)
  }


  return (
    <button
      id="counter"
      onClick={() => setScore(current => current + 1)}
    >
      Click to increment: {score}
    </button>
  )
}