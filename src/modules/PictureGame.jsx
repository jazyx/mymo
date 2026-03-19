/**
 * src/modules/PictureGame.jsx
 */


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
    played = {},
    score
  } = state


  const submitAnswer = (choice) => {
    dispatch({
      type: "CHECK_ANSWER",
      payload: {
        choice,
        player,
      }
    })

  }


  const nextRound = () => {
    dispatch({
      type: "NEW_ROUND"
    })
  }


  const images = choices
    .filter( choice => !!choice )
    .map(choice => {
    const className = (played[player] === choice) // user chose...
      ? (played[player] === word) // ... the right word?
        ? "right"
        : "wrong"
      : null

    return (
      <img
        key={choice}
        className={className}
        src={`images/${choice}.webp`}
        alt={choice}
        onClick={() => submitAnswer(choice)}
      />
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
        <button
          disabled={!found}
          onClick={nextRound}
        >
          Next Image
        </button>
      }
    </div>
  );
}