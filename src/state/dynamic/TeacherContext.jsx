/**
 * frontend/src/state/dynamic/TeacherContext.jsx
 *
 * Dynamically loaded Context for keeping track of:
 *
 *   + Teacher
 *   + Rooms
 *   + Groups
 */


import { createContext,  useState } from 'react'


export const TeacherContext = createContext()


export const TeacherProvider = ({ children }) => {
  const [ name, setName ] = useState("")
  const [ _id, set_id ] = useState("")
  
  
  const setNameAndId = ({ name, _id }) => {
    setName(name)
    set_id(_id)
  }
  

  return (
    <TeacherContext.Provider
      value ={{
        name,
        _id,
        setNameAndId
      }}
    >
      {children}
    </TeacherContext.Provider>
  )
}


export default {
  label: "Teacher",
  Context: TeacherContext,
  Provider: TeacherProvider
}
