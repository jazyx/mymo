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
  const [ _id, set_id ] = useState("")
  const [ name, setName ] = useState("")
  const [ key_phrase, setKey_phrase ] = useState("")



  const setUserData = ({ _id, name, key_phrase }) => {
    set_id(_id)
    setName(name)
    setKey_phrase(key_phrase) // for joinRoom() -> ejectUser()
  }

  return (
    <TeacherContext.Provider
      value ={{
        _id,
        name,
        key_phrase,
        setUserData
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
