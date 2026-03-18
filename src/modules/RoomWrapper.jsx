/**
 * frontend/src/modules/RoomWrapper.jsx
 */


import { useState, useEffect, Suspense } from 'react'
import { getContextValues, useInsertProviders } from '../state'
import { getLazyModule } from '../routes/RouteWrapper'
import { MemberList } from '../component/MemberList'
import { throbber } from '../component/Throbber'
import "../css/room.css"


const CONTEXTS = [
  './state/dynamic/WSContext.jsx',
  './state/dynamic/RoomContext.jsx'
]


export default function RoomWrapper(props) {
  const insertProviders = useInsertProviders()
  // RoomContext will only become accessible after useEffect
  // has run after the component is mounted.
  const [ error, setError ] = useState(0)
  const { children=[] } = props
  const [ lazyModules, setLazyModules ] = useState({})
  const { sendMessage } = getContextValues("WSContext")
  const {
    roomName,
    user,
    roomMembers,
    scores,
    setScores,
  } = getContextValues("RoomContext")


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


  const loadChildren = () => {
    children.forEach(({ label, path }) => {
      const Module = getLazyModule(path)

      if (Module) {
        setLazyModules(current => {
          if (!current[label]) {
            current[label] = (
              <Module
                key={label}
                label={label}
                {...props}
              />
            )
          }

          return { ...current }
        })
      }

    })
  }


  useEffect(loadContexts, [])
  useEffect(loadChildren, [children])


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


  return (
    <div
      id="room-wrapper"
    >
      <MemberList {...memberListProps}/>
      <Suspense fallback={throbber}>
        {Object.values(lazyModules)}
      </Suspense>
    </div>
  )
}