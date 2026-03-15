/**
 * src/modules/WordGame.jsx
 */


import { useGameCore } from "./useGameCore"
import { useFetchWords } from "./useFetchWords"
import "../css/shared.css"
import "../css/word-game.css"

const wordsAPI = 'words.json'


export default function WordGame() {
  const { words } = useFetchWords({ wordsAPI })
  
  const {
    word,
    choices,
    clicked,
    found,
    startNewGame,
    checkAnswer
  } = useGameCore({ words })


  const spans = choices
    .filter( word => !!word )
    .map(word => {
    const className =
      clicked.indexOf(word) < 0
        ? null
        : found === word
          ? "right"
          : "wrong"

    return (
      <span
        key={word}
        data-key={word}
        className={className}
        onClick={() => checkAnswer(word)}
      >
        {word}
      </span>
    )
  })


  return (
    <div className="word-game">
      <h2>Choose the Word</h2>
      <img src={`images/${word}.webp`} alt={word} />
      <p>{spans}</p>
      <button
        disabled={!found}
        onClick={startNewGame}
      >
        Next Word
      </button>
    </div>
  )
}
