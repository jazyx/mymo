/**
 * frontend/src/modules/TeacherUI.jsx
 */


import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInsertProviders, getContextValues } from '../state'


const CONTEXTS = ['./state/dynamic/TeacherContext.jsx']


export default function TeacherUI(props) {
  const navigate = useNavigate()
  const insertProviders = useInsertProviders()
  const [ error, setError ] = useState(0)
  
  const { name, _id } = getContextValues("TeacherContext")


  const loadContexts = () => {
    if (!name) {
      // Visit started at this page, so user has not been set yet.
      // Return to the Room Login page.
      return navigate("/login")
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


  useEffect(loadContexts, [])


  if (error) {
    throw new Error(error)
  }


  return (
    <div id="ui">
      <h1>{`UI for ${name} goes here`}</h1>
    </div>
  )
}