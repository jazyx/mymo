/**
 * frontend/src/modules/TeacherLogin.jsx
 */



import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next';

import { getContextValues, useInsertProviders } from '../state'
import Nav from '../components/Nav';
import '../css/ui.css'


const CONTEXTS = ['./state/dynamic/TeacherContext.jsx']


export default function TeacherLogin() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const insertProviders = useInsertProviders()
  const { origin } = getContextValues("APIContext")
  const { setUserData } = getContextValues("TeacherContext")
  const [ error, setError ] = useState(0)
  
  const [ teachers, setTeachers ] = useState([])
  const [ _id, set_id ] = useState()
  const [ createNew, setCreateNew ] = useState(false)
  const [ name, setName ] = useState("")
  const [ key_phrase, setKey_phrase ] = useState("")
  const [ failMessage, setFailMessage ] = useState("")

  const nameRef = useRef()


  const chooseTeacher = ({ target }) => {
    const id = target.value
    const create =  (id === "new-teacher")

    setCreateNew(create)
    set_id(() => id)
  }


  const focusOnTeacherName = () => {
    if (!createNew) { return }
   
    nameRef.current?.focus()
  }


  const updateKey_phrase = ({ target }) => {
    setKey_phrase(target.value)
  }


  const updateName = ({ target }) => {
    setName(() => target.value)
  }


  const treatLogin = authorized => {
    if (authorized) { // { _id, name, key_phrase }
      // console.log("authorized:", authorized)
      setUserData(authorized)
      navigate(`/teacher`)

    } else {
      setFailMessage(() => t("login.fail_password"))
      setKey_phrase(() => "")
    }
  }


  const loginOrCreateTeacher = event => {
    event.preventDefault()

    const data = (createNew) 
      ? { name, key_phrase }
      : { _id, key_phrase }
  
    const url = `${origin}/login/`
    const headers = { "Content-Type": "application/json" }
    const method = "POST"
    const credentials = "include"
    const body = JSON.stringify(data)

    const options = {
      headers,
      method,
      credentials,
      body
    }

    fetch(url, options)
      .then(response => response.json())
      .then(json => json.authorized) // { _id, name }
      .then(authorized => ({...authorized, key_phrase}))
      // .then(authorized => {
      //   console.log("authorized", JSON.stringify(authorized, null, '  '));
      //   return authorized
      // })
      .then(treatLogin)
      .catch(error => console.error("LOG_IN -", error))
  }


  const getTeachers = () => {
    if (!setUserData) { return }

    const url = `${origin}/getTeachers/`

    fetch(url)
      .then(response => response.json())
      .then(json => json.teachers)
      .then(teachers => {
        setTeachers(() => teachers)
        if (teachers.length) {
          const _id = teachers[0]._id          
          set_id(() => _id)
        }
      })
      .catch(error => console.error("GET_TEACHERS -", error))
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


  useEffect(loadContexts, [])
  useEffect(getTeachers, [setUserData])
  useEffect(focusOnTeacherName, [createNew])


  if (error) {
    throw new Error(error)
  }


  const teacherList = teachers.map(({ _id: teacher_id, name }) => (
    <option
      key={teacher_id}
      value={teacher_id}
    >
      {name}
    </option>
  ))
  teacherList.push(
    <option
      key="new-teacher"
      value="new-teacher"
    >
      {t("login.new_teacher")}
    </option>)


  const disabled = (createNew)
    ? !name // allow empty key_phrase, for teacher to set later
    : !_id || !key_phrase

  const label = (createNew)
    ? t("login.create_teacher")
    : t("login.log_in")


  return (
    <div
      id="ui"
    >
      <Nav disabled={true}/>
      <form action="">
        <h1>{t("login.teacher-title")}</h1>
        <label>
          <span>{t("login.teacher")}</span>
          <select
            onChange={chooseTeacher}
            value={_id}
          >
            {teacherList}
          </select>
        </label>
        { createNew && 
          <label>
            <span>{t("login.teacher_name")}</span>
            <input
              type="text"
              ref={nameRef}
              value={name}
              onChange={updateName}
            />
          </label>
        
        }
        <label>
          <span>{t("login.password")}</span>
          <input
            type="text"
            value={key_phrase}
            onChange={updateKey_phrase}
          />
        </label>
        <button
          className="primary"
          disabled={disabled}
          onClick={loginOrCreateTeacher}
        >
          {label}
        </button>
        <p className="fail">{failMessage}</p>
      </form>
      <span
        className="footer"
      />
    </div>
  )
}