/**
 * frontend/src/state/dynamic/RoomContext.jsx
 *
 * Dynamically loaded Context for keeping track of:
 *
 *   + Room members
 *   + Current activity
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
import { useNavigate } from 'react-router-dom'
import { getContextValues } from '..'


export const RoomContext = createContext()


export const RoomProvider = ({ children }) => {
  const navigate = useNavigate()
  const {
    requestSocket,
    userId,
    treatMessageListener,
    sendMessage
  } = getContextValues("WSContext")
  const [ roomMembers, setRoomMembers ] = useState([])

  // State variable to force re-render after useRef value changed
  const [ render, setRender ] = useState(0)
  const [ growl, setGrowl ] = useState("")
  

  // user|setUser and available|setAvailable are handled by
  // useRef() so that theny will never go out of scope.
  const roomRef = useRef()
  const setRoomName = roomName => {
    roomRef.current = roomName
    setRender(current => {
      return current + 1
    }) // force re-render
  }
  const userRef = useRef()
  const setUser = user => {
    userRef.current = user // provided as user: userRef.current
  }
  const availableRef = useRef([])
  const setAvailable = activities => {
    availableRef.current = activities
  }
  const activityRef = useRef({})
  const setActivity = activity => {
    activityRef.current = activity
  }


  const refreshRoomMembers = useCallback(
    function refreshRoomMembers({
    members,
    activities,
    activity
  }) {
    if (activities) { // only sent after joinRoom
      setAvailable(activities)
    }
    if (activity) {
      setActivity(activity)
    }

    // setRoomMembers will re-render the component
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


  const setRoomActivity = useCallback(
    function setRoomActivity({ activity }) {
    setActivity(activity)
    setRender(current => current + 1) // force re-render
    return true
  }, [])


  const treatActivity = useCallback(
    function treatActivity({ activity }) {
    setActivity(activity) // { path, state }
    setRender(current => current + 1)
  }, [])
  
  
  const showEjectionNotice = useCallback(
    function showEjectionNotice({ reason }) {
    setGrowl(`You are being disconnected ${reason || ""}`)
  }, [])


  const treatSocketClosed = useCallback(
    function treatSocketClosed() {
      navigate(`/`) // room/${roomRef.current}`)
  }, [])


  const setMessageListeners = () => {
    if (!treatMessageListener) { return }

    const listeners = [
      {
        subject: "MYMO.ROOM_MEMBERS",
        callback: refreshRoomMembers
      },
      {
        subject: "MYMO.SET_ROOM_ACTIVITY",
        callback: setRoomActivity
      },
      {
        subject: "MYMO.ACTIVITY",
        callback: treatActivity
      },
      {
        subject: "MYMO.EJECTION_NOTICE",
        callback: showEjectionNotice
      },
      {
        subject: "SOCKET_CLOSED",
        callback: treatSocketClosed
      }
    ]

    treatMessageListener("add", listeners)

    return () => {
      treatMessageListener("delete", listeners)
    }
  }


  const openSocket = () => {
    if (requestSocket) {
      requestSocket()
      setMessageListeners()
    }

    return () => {} // TODO? close socket?
  }


  const joinRoom = () => {
    if (!roomRef.current || !userId) { return }

    const message = {
      recipient_id: "MYMO",
      subject: "MYMO.JOIN_ROOM",
      roomName: roomRef.current
    }
    sendMessage(message)
  }


  const ejectUser = ({user_id, name, refreshRooms})=> {
    if (!userId) { return } // has not joined __admin__ group

    // Make sure that only teachers can eject other users
    const user = userRef.current
    if (user?.role !== "teacher") { return }
    const { _id: teacher_id } = user

    const message = {
      recipient_id: "MYMO",
      subject: "MYMO.EJECT_USER",
      teacher_id,
      user_id, // User._id of user to eject from all connections
      name,
      refreshRooms
    }
    sendMessage(message)
  }


  const dispatch = ({ type, payload }) => {
    const message = {
      recipient_id: "MYMO",
      subject: "MYMO.ACTIVITY",
      roomName: roomRef.current,
      type,
      payload,
    }
    sendMessage(message)
  }


  useEffect(openSocket, [requestSocket])
  useEffect(joinRoom, [roomRef.current, userId])


  return (
    <RoomContext.Provider
      value ={{
        roomName: roomRef.current, // string
        setRoomName, // called by defineRoomName() in Room.jsx
        roomMembers, // [{ _id, name, role, online }, ...]
        refreshRoomMembers, // called by checkLogInResult() —"—
        user: userRef.current, // { _id, name, role, online }
        setUser,            // called by checkLogInResult() —"—
        ejectUser,
        available: availableRef.current, // [{name, path, script}]
        activity: activityRef.current, // { path, state }
        dispatch,
        growl
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
