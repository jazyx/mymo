/**
 * frontend/src/component/MemberList.jsx
 */

import { getContextValues } from '../state'



export function MemberList(props) {
  const {
    classPicker,
    disabled,
    onClick,
    showScore
  } = props
  const {
    user,
    roomMembers = [],
    // setRoomMembers,
    // activity,
    // setActivity,
    scores,
    // setScores,
  } = getContextValues("RoomContext")


  const byScoreAndName = (a, b) => {
    const aName = a.name
    const bName = b.name
    const aScore = scores[aName] || 0
    const bScore = scores[bName] || 0

    // Higher score first
    if (aScore < bScore) {
      return 1
    } else if (aScore > bScore) {
      return -1

    // This user first if scores are equal
    } else if (a.name === user?.name) {
      return -1
    } else if (b.name === user?.name) {
      return 1

    // Alphabetical order if other members scores are equal
    } else if (a.name > b.name) {
      return 1
    } else if (a.name < b.name) {
      return -1
    }
  }


  const membersList = roomMembers
    .sort(byScoreAndName)
    .map( member => {
      const { _id, name } = member
      const className = classPicker(member)
      const score = scores[_id] || 0

      return (
        <li
          key={_id}
          data-id={_id}
          className={className}
          onClick={onClick}
        >
          <span className="name">
            {name}
          </span>
          { showScore && <span className="score">
            {score}
          </span>}
        </li>
      )
    }
  )


  return (
    <ol
      className={disabled ? "disabled" : null}
    >
      {membersList}
    </ol>
  )
}