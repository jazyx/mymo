/**
 * src/modules/PictureGame.jsx
 */


import { useGameCore } from "./useGameCore"
import { useFetchWords } from "./useFetchWords"
import "../css/shared.css"
import "../css/picture-game.css"

const wordsAPI = 'words.json'


export default function PictureGame(props) {
  const { error, words } = useFetchWords({ wordsAPI })
  const {
    word,
    choices,
    clicked,
    found,
    startNewGame,
    checkAnswer
  } = useGameCore({ words })


  const images = choices
    .filter( word => !!word )
    .map(word => {
    const className = (clicked.indexOf(word) < 0)
      ? null
      : (found === word)
        ? "right"
        : "wrong"

    return (
      <img
        key={word}
        className={className}
        src={`images/${word}.webp`}
        alt={word}
        onClick={() => checkAnswer(word)}
      />
    )
  })


  if (error) {
    throw new Error(error)
  }
    

  return (
    <div className="picture-game">
      <h2>Choose the Picture</h2>
      <div>
        {images}
      </div>
      <h2 className="prompt">{word}</h2>
      <button
        disabled={!found}
        onClick={startNewGame}
      >
        Next Image
      </button>
    </div>
  );
}