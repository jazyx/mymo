/**
 * src/modules/useFetchWords.jsx
 */


import { useState, useEffect } from 'react'


export const useFetchWords = ({ wordsAPI }) => {
  const [ words, setWords ] = useState([])
  const [ error, setError ] = useState()
    
  
  const fetchWords = () => {
    fetch(wordsAPI)
    .then(response => response.json())
    .then(words => setWords(words))
    .catch(error => {
      console.log("error:", error)
      setError(`JSON.parse() failed with "${wordsAPI}"`)
    })
  }
  
  useEffect(fetchWords, [])

  return { error, words }
}