/**
 * frontend/src/pages/Room.jsx
 * 
 * This is an optional/dynamically-imported module. It will not be
 * required when setting up a school, class membership or
 * sub-groups. However, a Route needs to be provided for it from
 * the beginning, so that it can be lazy-loaded when required.
 * 
 * Visiting /room/:RoomName sets roomName in RoomContext and this
 * triggers a call to JOIN_ROOM as soon as WebSocket connection
 * is established. The response to this call ("MYMO.ROOM_MEMBERS")
 * includes:
 *  
 * • The members of the named Room, from the database
 * • (just this once) the activities for this Room
 * 
 * In other words, both members and activities are fixed
 * immediately after the WebSocket connection is established.
 * 
 * This component allows users to log in with one of the known
 * member names for this Room, if they know the key_phrase for that
 * member (or if no key_phrase has been set yet).
 * 
 * If login is successful...
 * 
 *   navigate(`/room/${RoomName}/Activities`)
 * 
 * ... is called. This 
 */


import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { getContextValues, useInsertProviders } from '../state'
import { Throbber } from '../components/Throbber'
import { MemberList } from '../components/MemberList'
import "../css/room.css"


// HARD-CODED link to the Context(s) required by this component.
// Contexts and Providers will be inserted dynamically on useEffect
// after the components is first mounted. They will then remain
// available permanently.
const CONTEXTS = [
  "./state/dynamic/WSContext.jsx",
  "./state/dynamic/RoomContext.jsx"
]


export default function Room() {
  const { RoomName } = useParams() // to be set when Contexts set
  const navigate = useNavigate()   // used after successful login

  const insertProviders = useInsertProviders()
  // WSContext and RoomContext will only become accessible after
  // useEffect has run after the component is mounted.
  const [ error, setError ] = useState(0) // in Contexts fail

  // Choosing userName from member list; providing key_phrase
  const [ userName, setUserName ] = useState("")
  const [ key_phrase, setKey_phrase ] = useState("")
  const [ failMessage, setFailMessage ] = useState("")


  const {
    userId, // updated after re-render; runs setMessageListeners()
    treatMessageListener,
    sendMessage
  } = getContextValues("WSContext")
  const {
    setRoomName,        // RoomName read with useParams()
    roomName,           // required for logIn
    roomMembers = [],
    refreshRoomMembers, // handles user's new logged-in status
    setUser,            // user set here, but not read
  } = getContextValues("RoomContext")


  /**
   * Sent by Mymo login() only to the client logging in
   * @param {*} param0 
   */
  const checkLogInResult = ({ error, user, members }) => {
    if (error) { 
      setKey_phrase("") // Assume key_phrase was incorrect
      setFailMessage("Key phrase not valid. Try again.")

    } else { 
      // Log in was successful.
      setUser(user)

      // Update status of all room members.
      refreshRoomMembers({ members })

      // Go to the Activities page
      navigate(`/room/${RoomName}/Activities`)
    }
  }


  const chooseName = ({target}) => {
    const user_name = target.textContent
    setUserName(user_name)
    if (key_phrase) {
      logIn(user_name)
    }
  }


  const checkForEnter = event => {
    if (event.key === "Enter") {
      event.preventDefault()
      if (userName || key_phrase) {
        logIn()
      }
    }
  }


  const upateKeyPhrase = ({target}) => {
    setKey_phrase(target.value)
  }


  const logIn = (user_name) => {
    if (typeof user_name !== "string") {
      user_name = userName
    }

    const message = {
      subject: "LOG_IN",
      recipient_id: "SYSTEM",
      user_name,
      key_phrase,
      roomName
    }

    sendMessage(message)
  }


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


  const defineRoomName = () => {
    if (!setRoomName) { return }
    setRoomName(RoomName) // from params()
  }


  const setMessageListeners = () => {
    if (!userId) { return }

    const listeners = [
      {
        subject: "MYMO.LOGIN_RESULT",
        callback: checkLogInResult
      }
    ]

    treatMessageListener("add", listeners)

    return () => treatMessageListener("delete", listeners)
  }


  useEffect(loadContexts, [])
  useEffect(defineRoomName, [setRoomName])
  useEffect(setMessageListeners, [userId])


  if (error) {
    throw new Error(error)
  }


  const classPicker = ({ _id, name, online }) => {
    return ( name === userName )
      ? `selected${online ? " disabled" : ""}`
      : (online)
        ? "disabled"
        : null
  }


  const memberListProps = {
    classPicker,
    disabled: false,
    onClick: chooseName,
    showScore: false
  }


  if (!roomMembers.length) {
    return <Throbber />
  }


  return (
    <>
      <h3>Choose your name:</h3>
      <MemberList {...memberListProps} />
      <label>
        <span>Enter your key phrase:</span>
        <input
          type="text"
          value={key_phrase}
          onKeyDown={checkForEnter}
          onChange={upateKeyPhrase}
        />
      </label>
      <button
        onClick={logIn}
        disabled={!roomName || !userName || !key_phrase}
      >
        Log In
      </button>
      <p className="fail">{failMessage}</p>
    </>
  )
}