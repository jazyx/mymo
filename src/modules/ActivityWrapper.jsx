/**
 * frontend/src/modules/ActivityWrapper.jsx
 */


import { useState, useEffect, Suspense } from 'react'
import {
  useLocation,
  useNavigate
} from 'react-router-dom'

import { getContextValues, useInsertProviders } from '../state'
import { getLazyModule } from '../routes/RouteWrapper'

import MemberList from '../components/MemberList'
import ActivityList from '../components/ActivityList'
import Growler from '../components/Growler'
import { throbber } from '../components/Throbber'
import "../css/room.css"


const CONTEXTS = [
  './state/dynamic/WSContext.jsx',
  './state/dynamic/RoomContext.jsx'
]


export default function ActivityWrapper(props) {
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
    dispatch,
    scores,
    setScores,
    growl
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
    if (!activity?.path) { return }

    const Module = getLazyModule(activity.path)

    if (Module) {
      setLazyModule(() => Module)
    }
  }


  useEffect(loadContexts, [])
  useEffect(loadChildren, [activity?.path])


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
    state: (activity?.state || {}),
    showScore: true
  }


  const showControls = user?.role !== "student" || typeof LazyModule === "function"


  const moduleProps = {
    player: user?.name,
    showControls,
    state: activity?.state,
    dispatch
  }


  return (
    <div
      id="activity-wrapper"
    >
      <MemberList {...memberListProps}/>
      { showControls && <ActivityList available={available} /> }
      <Suspense fallback={throbber}>
        <LazyModule {...moduleProps}/>
      </Suspense>
      <Growler message={growl} />
    </div>
  )
}