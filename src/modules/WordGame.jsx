/**
 * src/modules/WordGame.jsx
 */


import { useState, useEffect } from 'react'
import "../css/shared.css"
import "../css/word-game.css"


export default function WordGame({
  showControls,
  state={},
  player,
  dispatch
}) {
  const {
    word,
    choices,
    found,
    played = {}
  } = state
  const [ clicked, setClicked ] = useState([])


  const reset = () => {
    setClicked(() => [])
  }



  const submitAnswer = (choice) => {
    const chosen = !played[player]

    if (chosen) {
      // Send the first answer to the backend
      dispatch({
        type: "CHECK_ANSWER",
        payload: {
          choice,
          player,
        }
      })
    }

    // Remember that this word has already been clicked
    if (clicked.indexOf(choice) < 0) {
      setClicked(current => [...current, choice])
    }
  }


  const nextRound = () => {
    dispatch({
      type: "NEW_ROUND"
    })
  }


  useEffect(reset, [word])


  const spans = choices
    .filter( choice => !!choice )
    .map(choice => {

    const className = (played[player] === choice) // user chose...
      ? (played[player] === word) //           ... the right word?
        ? "right"
        : "wrong"
      : (clicked.indexOf(choice) < 0) // user did not click this...
        ? null
        : (choice === word)   // ... but found the right answer
          ? "found"
          : "wrong"

    return (
      <span
        key={choice}
        data-key={choice}
        className={className}
        onClick={() => submitAnswer(choice)}
      >
        {choice}
      </span>
    )
  })


  return (
    <div className="word-game">
      <h2>Choose the Word</h2>
      <img src={`images/${word}.webp`} alt={word} />
      <p>{spans}</p>
      { showControls &&
        <div className="buttons">
          <button
            className="done"
            disabled={!found}
            onClick={nextRound}
          >
            Next Image
          </button>
          <button
            className="force"
            onClick={nextRound}
          >
            ➤
          </button>
        </div>
      }
    </div>
  )
}