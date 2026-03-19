/**
 * frontend/src/modules/OddOneOut.jsx
 */


import { useState, useEffect } from 'react'
import "../css/shared.css"
import "../css/odd-one-out.css"


export default function OddOneOut({
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
  
  
  const getChosenWords = callback => {
    if (!callback) {
      callback = checkAnswer
    }

    const chosenWords = choices.map(choice => {
      const className = (played[player] === choice)
        ? (played[player] === word)
          ? "right"
          : "wrong"
        : (clicked.indexOf(choice) < 0)
          ? null
          : (choice === word) 
            ? "found"
            : "wrong"

      const attributes = {
        className,
        onClick: () => callback(choice)
      }

      return (
        <span
          key={choice}
          {...attributes}
        >
          {choice}
        </span>
      )
    })

    return chosenWords
  }


  const words = getChosenWords(submitAnswer)


  useEffect(reset, [word])


  return (
    <div className="odd-one-out-game">
      <h2>Find the Odd One Out</h2>
      <div
        className="choices"
      >
        {words}
      </div>

      { showControls &&
        <div className="buttons">
          <button
            className="done"
            disabled={!found}
            onClick={nextRound}
          >
            Next Set of Words
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
  );
}