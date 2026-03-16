/**
 * src/modules/Home.jsx
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getContextValues, useInsertProviders } from '../state'
import { Throbber } from '../component/Throbber'
import "../css/home.css"


// HARD-CODED link to the Context(s) required by this component.
// Contexts and Providers will be inserted dynamically on useEffect
// after the components is first mounted. They will then remain
// available permanently.
const CONTEXTS = ["./state/dynamic/WSContext.jsx"]
const CLASS_NAME = "Thursday"


export default function Home() {
  const navigate = useNavigate()
  const insertProviders = useInsertProviders()
  // CounterContext will only become accessible after useEffect
  // has run after the component is mounted.
  const [ error, setError ] = useState(0)
  const [ classMembers, setClassMembers ] = useState([])
  const [ userName, setUserName ] = useState("") // local choice
  const [ key_phrase, setKey_phrase ] = useState("")
  const [ failMessage, setFailMessage ] = useState("")
  
  
    
  const {
    userId, // updated after re-render
    user_name,
    socketIsOpen,
    socketError,
    requestSocket,
    treatMessageListener,
    sendMessage
  } = getContextValues("WSContext")


  const joinClass = () => {
    const message = {
      recipient_id: "MYMO",
      subject: "MYMO.JOIN_CLASS",
      class_name: CLASS_NAME // HARD-CODED for now
    }
    sendMessage(message)
  }


  const showClassMembers = ({ content }) => {
    setClassMembers(content)
  }


  const checkLogInResult = ({ content }) => {
    if (content === "LOGIN FAILED") {
      // setUserName("")
      setKey_phrase("")
      setFailMessage("Key phrase not valid. Try again.")
    } else {
      setFailMessage("")
      showClassMembers({ content })
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
    console.log("target.value:", target.value)
    setKey_phrase(target.value)
  }


  const logIn = () => {
    const message = {
      subject: "LOG_IN",
      recipient_id: "MYMO",
      user_name: userName,
      key_phrase,
      class_name: CLASS_NAME
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


  const openSocket = () => {
    if (requestSocket) {
      requestSocket()
    }
  }


  const setMessageListeners = () => {
    if (!userId) { return }
    treatMessageListener(
      "add",
      [
        {
          subject: "MYMO.CLASS_MEMBERS",
          callback: showClassMembers
        },
        {
          subject: "MYMO.LOGGED_IN",
          callback: checkLogInResult
        }
      ]
    )

    joinClass()
  }


  const goClassRoute = () => {
    if (user_name) {
      navigate("/class/")
    }
  }


  useEffect(loadContexts, [])
  useEffect(openSocket, [requestSocket])
  useEffect(setMessageListeners, [userId])
  useEffect(goClassRoute, [user_name])


  if (error) {
    throw new Error(error)
  }


  const memberList = classMembers.map(({ _id, name, online }) => {
    const className = ( name === userName )
      ? `selected${online ? " disabled" : ""}`
      : (online)
        ? "disabled"
        : null

    return (
      <li
        key={_id}
        className={className}
        onClick={chooseName}
        disabled={online}
      >
        {name}
      </li>
    )
  })


  if (!memberList.length) {
    return <Throbber />
  }



  return (
    <>
      <h3>Choose your name:</h3>
      <ul>{memberList}</ul>
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