/**
 * src/modules/Counter.jsx
 *
 * A simple component to illustrate dynamic insertion of a Context
 * and its Provider.
 */


import { useEffect } from 'react'
import { getContextValues, useInsertProviders } from '../state'


// HARD-CODED link to the Context(s) required by this component.
// Contexts and Providers will be inserted dynamically on useEffect
// after the components is first mounted. They will then remain
// available permanently.
const CONTEXTS = ["./state/dynamic/CounterContext.jsx"]


export default () => {
  const insertProviders = useInsertProviders()
  // CounterContext will only become accessible after useEffect
  // has run after the component is mounted.
  const { score, setScore } = getContextValues("CounterContext")


  const loadContexts = () => {
    insertProviders(CONTEXTS)
  }


  useEffect(loadContexts, [])


  return (
    <button
      onClick={() => setScore(current => current + 1)}
    >
      Click to increment: {score}
    </button>
  )
}