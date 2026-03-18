/**
 * frontend/src/modules/RoomWrapper.jsx
 */


import { useState, useEffect, Suspense } from 'react'
import {
  useLocation,
  useNavigate
} from 'react-router-dom'

import { getContextValues, useInsertProviders } from '../state'
import { getLazyModule } from '../routes/RouteWrapper'
import { MemberList } from '../components/MemberList'
import { ActivityList } from '../components/ActivityList'
import { throbber } from '../components/Throbber'
import "../css/room.css"


const CONTEXTS = [
  './state/dynamic/WSContext.jsx',
  './state/dynamic/RoomContext.jsx'
]


export default function RoomWrapper(props) {
  const location = useLocation()
  const navigate = useNavigate()

  const insertProviders = useInsertProviders()
  // RoomContext will only become accessible after useEffect
  // has run after the component is mounted.
  const [ error, setError ] = useState(0)
  const [ LazyModule, setLazyModule ] = useState(() => () => "")
  const { sendMessage } = getContextValues("WSContext")
  const {
    roomName,
    user,
    available,
    activity,
    scores,
    setScores,
  } = getContextValues("RoomContext")


  const loadContexts = () => {
    if (!user) {
      // Visit started at this page, so user has not been set yet.
      // Return to the Room Login page.
      const parent = location.pathname.replace(/\/Activities$/, "")
      return navigate(parent)
    }

    const insertContexts = async () => {
      // React can't intercept an error that occurs in an async
      // function, so we have to catch it here and throw it during
      // the render process
      const error = await insertProviders(CONTEXTS)
      setError(error)
    }
    insertContexts()
  }


  const loadChildren = () => {
    if (!activity?.children) { return }

    const path = activity.children[0].path
    const Module = getLazyModule(path)

    if (Module) {
      setLazyModule(() => Module)  
    }
  }


  useEffect(loadContexts, [])
  useEffect(loadChildren, [activity?.children])


  const classPicker = ({ role, online }) => {
    return (role === "teacher")
        ? `teacher${online ? "" : " offline"}`
        : (role === "cohost")
          ? `cohost${online ? "" : " offline"}`
          : (online)
            ? null
            : "offline"
  }


  const setCohost = ({ target }) => {
    target = target.closest("li")
    const cohost_id = target.dataset.id

    const message = {
      subject: "MYMO.SET_COHOST",
      recipient_id: "MYMO",
      roomName,
      cohost_id
    }
    sendMessage(message)
  }


  const memberListProps = {
    classPicker,
    disabled: !user || user.role === "student",
    onClick: setCohost,
    showScore: true
  }


  const showControls = user?.role !== "student" || typeof LazyModule === "function"


  return (
    <div
      id="room-wrapper"
    >
      <MemberList {...memberListProps}/>
      { showControls && <ActivityList available={available} /> }
      <Suspense fallback={throbber}>
        <LazyModule />
      </Suspense>
    </div>
  )
}