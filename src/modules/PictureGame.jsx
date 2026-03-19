/**
 * src/modules/PictureGame.jsx
 */


import { useState, useEffect } from 'react'
import "../css/shared.css"
import "../css/picture-game.css"


export default function PictureGame({
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


  const images = choices
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
      <div className="frame">
        <img
          key={choice}
          className={className}
          src={`images/${choice}.webp`}
          alt={choice}
          onClick={() => submitAnswer(choice)}
        />
      </div>
    )
  })


  return (
    <div className="picture-game">
      <h2>Choose the Picture</h2>
      <div>
        {images}
      </div>
      <h2 className="prompt">{word}</h2>

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
  );
}