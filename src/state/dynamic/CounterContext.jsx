/**
 * src/state/CounterContext.jsx
 *
 * A simple Context to preserve a score state when the user
 * navigates to and from the module that uses it.
 */


import React, { createContext, useState } from 'react'


export const CounterContext = createContext()


export const CounterProvider = ({ children }) => {
  const [ score, setScore ] = useState(0)

  return (
    <CounterContext.Provider
      value ={{
        score,
        setScore
      }}
    >
      {children}
    </CounterContext.Provider>
  )
}


// Called by state/index.jsx: all the details of this Context
// in one place
export default {
  label: "Counter",
  Context: CounterContext,
  Provider: CounterProvider
}