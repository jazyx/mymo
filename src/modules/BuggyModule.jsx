/**
 * src/modules/BuggyModule.jsx
 */


import { useState, useEffect } from 'react'


export default function BuggyModule() {
  const [ countDown, setCountDown ] = useState(3)
  const [ shouldCrash, setShouldCrash ] = useState(false)
  

  const runTimer = () => {
    setCountDown(timeLeft => --timeLeft)
  }
  

  const startCountdown = () => {
    const interval = setInterval(runTimer, 1000)

    return () => clearInterval(interval)
  }


  if (!countDown) {
    setTimeout(
      () => setShouldCrash(true),
      500
    )
  }


  if (shouldCrash) {
    throw new Error("Deliberately crashing the Buggy Module")
  }     


  useEffect(startCountdown, [])


  const message = (countDown < 1)
    ? <p style={{color: "#900", fontStyle:"bold"}}>Crashing...!</p>
    : <p>Buggy Module will crash in {countDown} second{countDown === 1 ? "" : "s"}...</p>
  

  return message
}