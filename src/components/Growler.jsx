/**
 * frontend/src/components/Growler.jsx
 */


import { useState, useEffect } from 'react'


const DISPLAY_TIME = 4000


export default function Growler({ message }) {
  const [ growl, setGrowl ] = useState("")


  const setTimedGrowl = () => {
    if (!message) { return }

    setGrowl(message)

    setTimeout(() => setGrowl(""), DISPLAY_TIME)
  }


  useEffect(setTimedGrowl, [message])
  

  return (
    <p className="growl">{growl}</p>
  )
}