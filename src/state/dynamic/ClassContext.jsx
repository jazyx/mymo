/**
 * frontend/src/state/dynamic/ClassContext.jsx
 *
 * Dynamically loaded Context for keeping track of:
 *
 *   + Class members
 *   + Current activity
 *   + Member scores
 *
 * • Below WSContext in the Provider component tree.
 * • Calls WSContext's requestSocket as soon as this is available.
 * • Sends "MYMO.JOIN_CLASS" message to backend as soon as the
 *   userId has been set, so that it can be added as sender_id
 *   for the outgoing message.
 * • Treats incoming messages for "MYMO.CLASS_MEMBERS"
 *   using this to refreshClassMembers() and toggle cohost
 *
 * For the first prototype, uses HARD-CODED class_name "Thursday"
 * as name of class, in order to obtain that class's members.
 */


import {
  createContext,
  useState,
  useRef,
  useEffect,
  useCallback
} from 'react'
import { getContextValues } from '../'


export const ClassContext = createContext()


export const ClassProvider = ({ children }) => {
  const {
    requestSocket,
    socketIsOpen,
    userId,
    treatMessageListener,
    sendMessage
  } = getContextValues("WSContext")
  // HARD-CODED class_name // HARD-CODED class_name //
  const [ class_name, setClass_name ] = useState("Thursday")

  const [ classMembers, setClassMembers ] = useState([])
  // user|setUser is handled as a useRef() so that it will never
  // go out of scope.
  const userRef = useRef()
  const setUser = user => {
    userRef.current = user // provided as user: userRef.current
  }

  const [ available, setAvailable ] = useState([])
  const [ activity, setActivity ] = useState("")
  const [ scores, setScores ] = useState({})


  const refreshClassMembers = useCallback(({ members }) => {
    // console.log(
    //   "refreshClassMembers,
    //   JSON.stringify(members, null, 2)
    // )
    setClassMembers(() => members)
    const user = userRef.current

    if (user) {
      // This user is logged in and has a role. Check if the
      // the user's role has changed ("student" <> "cohost")
      const member = members.find(({ _id }) => (
        _id === user._id
      ))

      if (member && user.role !== member.role) {
        console.log(`Change role of ${member.name} from ${user.role} to ${member.role}`)

        user.role = member.role
      }
    }
  }, [])


  const joinClass = () => {
    if (!userId) { return }

    const message = {
      recipient_id: "MYMO",
      subject: "MYMO.JOIN_CLASS",
      class_name
    }
    sendMessage(message)
  }


  const setMessageListeners = () => {
    if (!treatMessageListener) { return }

    const listeners = [
      {
        subject: "MYMO.CLASS_MEMBERS",
        callback: refreshClassMembers
      }
    ]

    treatMessageListener("add", listeners)

    return () => treatMessageListener("delete", listeners)
  }


  const openSocket = () => {
    if (requestSocket) {
      // console.log("openSocket called")
      requestSocket()
      setMessageListeners()
    }

    return () => {}
  }


  useEffect(openSocket, [requestSocket])
  useEffect(joinClass, [userId])


  return (
    <ClassContext.Provider
      value ={{
        class_name,
        classMembers,
        refreshClassMembers,
        user: userRef.current,
        setUser,
        // activity,
        // setActivity,
        scores,
        // setScores
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
