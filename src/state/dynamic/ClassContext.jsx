/**
 * frontend/src/state/dynamic/ClassContext.jsx
 *
 * Dynamically loaded Context for keeping track of:
 * 
 *   + Class members
 *   + Current activity
 *   + Member scores
 */


import React, { createContext, useState } from 'react'


export const ClassContext = createContext()


export const ClassProvider = ({ children }) => {
  const [ classMembers, setClassMembers ] = useState([])
  const [ available, setAvailable ] = useState([])
  const [ activity, setActivity ] = useState("")
  const [ scores, setScores ] = useState({})
  

  return (
    <ClassContext.Provider
      value ={{
        classMembers,
        setClassMembers,
        activity,
        setActivity,
        scores,
        setScores,
      }}
    >
      {children}
    </ClassContext.Provider>
  )
}


export default {
  label: "Class",
  Context: ClassContext,
  Provider: ClassProvider
}
