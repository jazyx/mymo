/**
 * frontend/src/state/dynamic/RoomContext.jsx
 *
 * Dynamically loaded Context for keeping track of:
 *
 *   + Room members
 *   + Current activity
 *   + Member scores
 *
 * • Below WSContext in the Provider component tree.
 * • Calls WSContext's requestSocket as soon as this is available.
 * • Sends "MYMO.JOIN_ROOM" message to backend as soon as the
 *   userId has been set, so that it can be added as sender_id
 *   for the outgoing message.
 * • Treats incoming messages for "MYMO.ROOM_MEMBERS"
 *   using this to refreshRoomMembers() and toggle cohost
 *
 * For the first prototype, uses HARD-CODED roomName "Thursday"
 * as name of room, in order to obtain that room's members.
 */


import {
  createContext,
  useState,
  useRef,
  useEffect,
  useCallback
} from 'react'
import { getContextValues } from '..'


export const RoomContext = createContext()


export const RoomProvider = ({ children }) => {
  const {
    requestSocket,
    userId,
    treatMessageListener,
    sendMessage
  } = getContextValues("WSContext")
  // HARD-CODED roomName // HARD-CODED roomName //
  const [ roomName, setRoomName ] = useState()

  const [ roomMembers, setRoomMembers ] = useState([])
  // user|setUser and available|setAvailable are handled by
  // useRef() so that theny will never go out of scope.
  const userRef = useRef()
  const setUser = user => {
    userRef.current = user // provided as user: userRef.current
  }
  const availableRef = useRef([])
  const setAvailable = activities => {
    availableRef.current = activities
  }

  const [ activity, setActivity ] = useState("")
  const [ scores, setScores ] = useState({})


  const refreshRoomMembers = useCallback(({ 
    members,
    activities
  }) => {
    if (activities) { // only sent after joinRoom
      setAvailable(activities)
      console.log("activities:", activities)
    }

    setRoomMembers(() => members)
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


  const joinRoom = () => {
    if (!userId) { return }

    const message = {
      recipient_id: "MYMO",
      subject: "MYMO.JOIN_ROOM",
      roomName
    }
    sendMessage(message)
  }


  const setMessageListeners = () => {
    if (!treatMessageListener) { return }

    const listeners = [
      {
        subject: "MYMO.ROOM_MEMBERS",
        callback: refreshRoomMembers
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
  useEffect(joinRoom, [userId])


  return (
    <RoomContext.Provider
      value ={{
        roomName,
        setRoomName,
        roomMembers,
        refreshRoomMembers,
        user: userRef.current,
        setUser,
        available: availableRef.current,
        setAvailable,
        // activity,
        // setActivity,
        scores,
        // setScores
      }}
    >
      {children}
    </RoomContext.Provider>
  )
}


export default {
  label: "Room",
  Context: RoomContext,
  Provider: RoomProvider
}
