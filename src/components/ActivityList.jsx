/**
 * frontend/src/components/ActivityList.jsx
 */


import { getContextValues } from '../state'


export function ActivityList({ available=[] }) {
  const { user, roomName } = getContextValues("RoomContext")
  const { sendMessage } = getContextValues("WSContext")


  const adoptActivity = ({ target }) => {
    const activity = JSON.parse(target.dataset.activity)
    // { path: "./modules/GameName.jsx", label: "Game Name" }

    const message = {
      subject: "MYMO.SET_ROOM_ACTIVITY",
      recipient_id: "MYMO",
      roomName,
      activity
    }
    sendMessage(message)
  }


  const activityList = available.map( activity => (
    // { _id, name, path, script }
    <button
      key={activity.path}
      disabled={user.role === "student"}
      onClick={adoptActivity}
      data-activity={JSON.stringify(activity)}
    >
      {activity.name}
    </button>
  ))


  return (
    <div>
      {activityList}
    </div>
  )
}