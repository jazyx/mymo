/**
 * frontend/src/modules/ClassWrapper.jsx
 */


import { useState, useEffect, Suspense } from 'react'
import { getContextValues, useInsertProviders } from '../state'
import { getLazyModule } from '../routes/RouteWrapper'
import { MemberList } from '../component/MemberList'
import { throbber } from '../component/Throbber'
import "../css/class.css"


const CONTEXTS = [
  './state/dynamic/WSContext.jsx',
  './state/dynamic/ClassContext.jsx'
]


export default function ClassWrapper(props) {
  const insertProviders = useInsertProviders()
  // ClassContext will only become accessible after useEffect
  // has run after the component is mounted.
  const [ error, setError ] = useState(0)
  const { children=[] } = props
  const [ lazyModules, setLazyModules ] = useState({})
  const { sendMessage } = getContextValues("WSContext")
  const {
    class_name,
    user,
    classMembers,
    scores,
    setScores,
  } = getContextValues("ClassContext")


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
      class_name,
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
      id="class-wrapper"
    >
      <MemberList {...memberListProps}/>
      <Suspense fallback={throbber}>
        {Object.values(lazyModules)}
      </Suspense>
    </div>
  )
}