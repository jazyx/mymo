/**
 * frontend/src/pages/Room.jsx
 */


import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { getContextValues, useInsertProviders } from '../state'
import { Throbber } from '../component/Throbber'
import { MemberList } from '../component/MemberList'
import "../css/room.css"


// HARD-CODED link to the Context(s) required by this component.
// Contexts and Providers will be inserted dynamically on useEffect
// after the components is first mounted. They will then remain
// available permanently.
const CONTEXTS = [
  "./state/dynamic/WSContext.jsx",
  "./state/dynamic/RoomContext.jsx"
]


export default function LogIn() {
  const params = useParams()
  const { RoomName } = params
  const navigate = useNavigate()
  const insertProviders = useInsertProviders()
  // CounterContext will only become accessible after useEffect
  // has run after the component is mounted.
  const [ error, setError ] = useState(0)
  const [ userName, setUserName ] = useState("") // local choice
  const [ key_phrase, setKey_phrase ] = useState("")
  const [ failMessage, setFailMessage ] = useState("")


  const {
    userId, // updated after re-render
    // user_name,
    // socketIsOpen,
    // socketError,
    // requestSocket,
    treatMessageListener,
    sendMessage
  } = getContextValues("WSContext")
  const {
    roomName,
    setRoomName,
    roomMembers = [],
    refreshRoomMembers,
    // user,
    setUser,
    // activity,
    // setActivity,
    // scores,
    // setScores,
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
    setUserName(target.textContent)

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


  const logIn = () => {
    const message = {
      subject: "LOG_IN",
      recipient_id: "SYSTEM",
      user_name: userName,
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
    setRoomName(RoomName)
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
        disabled={!userName || !key_phrase}
      >
        Log In
      </button>
      <p className="fail">{failMessage}</p>
    </>
  )
}