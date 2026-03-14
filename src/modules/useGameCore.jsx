/**
 * 20-HookedGames/games/useGameCore.jsx
 */


import { useState, useEffect } from "react"

export function useGameCore({ words }) {
  const [word, setWord] = useState("")
  const [choices, setChoices] = useState([])
  const [clicked, setClicked] = useState([])
  const [found, setFound] = useState(false)


  const startNewGame = (word, choices) => {
    if (typeof word !== "string") { // click event
      if (!words) {
        // The custom game should provide its own word and choices
        return
      }
      
      // Use the standard technique for choosing words
      word = getSomeFrom(words, 1, 3, "moveToEnd")[0]
      choices = getSomeFrom(words, 3, 1)
    }

    const random = Math.floor(Math.random() * 4)
    choices.splice(random, 0, word)

    setWord(word)
    setChoices(choices)
    setClicked([])
    setFound(false)
  }

  const checkAnswer = (text) => {
    setClicked(prev => [...prev, text])
    if (text === word) {
      setFound(text)
    }
  }

  useEffect(startNewGame, [words && words.length])
  // OK if startNewGame returns nothing

  return {
    word,
    choices,
    clicked,
    found,
    startNewGame,
    checkAnswer
  }
}


// UTILITY FUNCTIONS // UTILITY FUNCTIONS // UTILITY FUNCTIONS //

const shuffle = array => {
  for (let ii = array.length - 1; ii > 0; ii--) {
    const jj = Math.floor(Math.random() * (ii + 1));
    [array[ii], array[jj]] = [array[jj], array[ii]]
  }
  return array // allows chaining
}


// getSomeFrom is good for small arrays, but may not scale well 
// to thousands of words
export const getSomeFrom = (
  array,
  howMany,
  toIgnore=0,
  moveToEnd
) => {
  const allowed = array.slice(0, array.length - toIgnore)
  const some = shuffle(allowed).slice(0, howMany)

  if (moveToEnd) {
    some.forEach(( value ) => {
      const index = array.indexOf(value)
      array.splice(index, 1)
      array.push(value)
    })
  }

  return some
}
