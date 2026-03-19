/**
 * frontend/logic/APIContext.jsx
 */


import { createContext } from 'react'

const ORIGIN = import.meta.env.VITE_ORIGIN
const dev = false // /^localhost:517\d$/.test(window.location.host)
const origin = dev ? ORIGIN : "mymo.jazyx.com"


export const APIContext = createContext()


export const APIProvider = ({ children }) => {

  return (
    <APIContext.Provider
      value ={{
        origin
      }}
    >
      {children}
    </APIContext.Provider>
  )
}


export default {
  label: "API",
  Context: APIContext,
  Provider: APIProvider
}