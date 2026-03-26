/**
 * frontend/src/modules/ClassManagement.jsx
 */


import { useState, useEffect, use } from 'react'
import { useTranslation, Trans } from 'react-i18next';
import { getContextValues, useInsertProviders } from '../state';
import EditButtons from '../components/EditButtons'
import Growler from '../components/Growler';


// HARD-CODED link to the Context(s) required by this component.
// Contexts and Providers will be inserted dynamically on useEffect
// after the components is first mounted. They will then remain
// available permanently.
const CONTEXTS = [
  "./state/dynamic/WSContext.jsx",
  "./state/dynamic/RoomContext.jsx"
]


export default function ClassManagement(props) {
  const { t } = useTranslation()
  const { origin } = getContextValues("APIContext")
  // WSContext required for ejectUser
  const insertProviders = useInsertProviders()
  const [ error, setError ] = useState(0)

  const {
    treatMessageListener,
    sendMessage
  } = getContextValues("WSContext")
  // console.log("sendMessage:", sendMessage)
  const {
    _id: teacher_id,
    name,
    key_phrase,
   } = getContextValues("TeacherContext")
  const {
    setRoomName,
    roomName,
    ejectUser,
    setUser,
    user
  } = getContextValues("RoomContext")
  const [ rooms, setRooms ] = useState([])
  // [{ _id, name, activities, members, + editable, current }, ...]
  const [ selectedRoom, setSelectedRoom ] = useState()
  const [ growl, setGrowl ] = useState("")



  const updateValue = ({ target }) => {
    const { type } = target.dataset
    const { id } = target.closest("li").dataset
    const members = getRoomMembers(selectedRoom)
    const member = members.find(({ _id }) => _id === id )
    member.current[type] = target.value

    forceRoomRerender(selectedRoom, members)
  }


  const getRoomMembers = room_id => {
    const room = rooms.find(({ _id }) => _id === room_id)
    return room?.members || []
  }


  /**
   * Sent by Mymo login() only to the client logging in
   * @param {*} param0
   */
  function checkLogInResult({ error, user, members }) {
    if (!error) {
      // Log in was successful.
      setUser(user)
    }

    return true
  }


  function showEjectionResult({ message }) {
    setGrowl(message)
  }


  /**
   * Called in three different cases:
   * 1. When the ✏️ button is clicked, to start editing
   * 2. When the ↩️ button is clicked, to cancel changes
   * 3. When the ↗️ button is clicked, to save changes
   *
   * @param {object or string} id will be
   *        • a click event, if the call came from a click on the
   *          ✏️ button
   *        • an _id string if the call came from an EditButtons
   *          callback (↩️ or ↗️)
   * @param {truthy} revert will be true if the call came from the
   *        Cancel Edit button  ↩️; from ✏️ or ↗️ it's undefined
   */
  const handleEdit = (id, revert) => {
    const target = id.target
    if (target) { // userData is a click event; target is element
      id = target.closest("li").dataset.id
    }

    // Find room.members entry for the selectRoom
    const members = getRoomMembers(selectedRoom)
    const member = members.find(({ _id }) => _id === id )
    const { current } = member // with altered? name and key_phrase

    if (revert) { // edit action was cancelled: remove alterations
      current.name = member.name
      current.key_phrase = member.key_phrase
      current.edited = false
      member.editable = false
    }

    if (target) {
      member.editable = true // editing is about to start
    }

    if (current.edited) { // tell the database about the changes
      current.fetching === true
      return updateUser(current)
      // fetch thenable will call forceRoomRerender with new
      // member data
    }

    forceRoomRerender(
      selectedRoom,
      members,
      // members.map( member => member ) // clone each member
    )
  }


  const updateUser = data => {
    // { _id, name, key_phrase, nameChanged }
    const url = `${origin}/updateUser`
    const headers = { "Content-Type": "application/json" }
    const method = "POST"
    const credentials = "include"
    const body = JSON.stringify(data)

    const options = {
      headers,
      method,
      credentials,
      body
    }

    fetch(url, options)
      .then(response => response.json())
      .then(userUpdated)
      .catch(error => console.error("UPDATE USER -", error))
  }


  /**
   * Treats response to updateUser() call to database API.
   * • Updates the local record for the User whose values have been
   *   changed on the database.
   * • Disconnects any WebSocket connections made using the
   *   previous name and key_phrase.
   *
   * @param {object} user: { _id, name, key_phrase, role }
   */
  const userUpdated = ({ user, refreshRooms }) => {
    const { _id: user_id, name, key_phrase } = user
    setRooms(current => {
      current = current.map( room => {
        const member = room.members.find(
          ({ _id }) => _id === user_id
        )

        if (member) {
          // Alter user data in place
          const { current } = member
          current.name = member.name = name
          current.key_phrase = member.key_phrase = key_phrase
          current.fetching = false
          current.edited = false
          member.editable = false
        }

        return room
      })

      return current // cloned object
    })

    // Use WSContext via RoomContext ("admin") to eject any user
    // currently logged in to an activity with the previous name
    // or key_phrase, so that the rightful user can log in.
    if (ejectUser) { // Ensure RoomContext is available
      ejectUser({user_id, name, refreshRooms})
    }
  }


  const deleteMember = () => {

  }


  const selectRoom = ({ target }) => {
    const room_id = target.value
    const chosen = rooms.find( room => (
      room._id === room_id
    )) || {members: []} // if find() returns undefined

    if (!chosen.members.current) {
      // This room hasn't been selected before. Add fields to
      // allow for editing name and key_phrase later, and call
      // setRooms with the revised room data
      prepareRoomForEditing(chosen)
    }

    setSelectedRoom(room_id)
  }


  const prepareRoomForEditing = room => {
    let { _id: room_id, members } = room
    members = members.map( member => {
      const { _id, name, key_phrase } = member
      member.current = { _id, name, key_phrase }
      member.editable = false
      return member
    })

    forceRoomRerender(room_id, members)
  }


  const forceRoomRerender = (room_id, members) => {
    setRooms(current => {
      current = current.map( room => { // new object —> re-render
        if (room._id === room_id) {
          room = { ...room, members } // clone room
        }
        return room // unchanged if _ids don't match
      })
      return current
    })
  }


  const loadContexts = () => {
    const insertContexts = async () => {
      // React can't intercept an error that occurs in an async
      // function, so we have to catch it here and throw it during
      // the render process
      const error = await insertProviders(CONTEXTS)
      setError(error)
    }
    insertContexts()
  }


  const getTeacherRooms = () => {
    const data = { teacher_id }
    const url = `${origin}/getTeacherRooms`
    const headers = { "Content-Type": "application/json" }
    const method = "POST"
    const credentials = "include"
    const body = JSON.stringify(data)

    const options = {
      headers,
      method,
      credentials,
      body
    }

    fetch(url, options)
      .then(response => response.json())
      .then(json => json.rooms)
      .then(setRooms)
      .catch(error => console.error("TEACHER_ROOMS -", error))
  }


  const defineRoomName = () => {
    if (!setRoomName || !rooms.length || roomName) { return }
    setRoomName(rooms[0].name) // arbitrary room, just to log in
  }


  const setMessageListeners = () => {
    if (!treatMessageListener) { return }

    const listeners = [
      {
        subject: "MYMO.LOGIN_RESULT",
        callback: checkLogInResult
      },
      {
        subject: "MYMO.EJECTION_RESULT",
        callback: showEjectionResult
      }
    ]
    treatMessageListener("add", listeners)

    return () => treatMessageListener("delete", listeners)
  }


  const login = () => {
    if (!sendMessage || !roomName) { return }

    const message = {
      subject: "LOG_IN",
      recipient_id: "SYSTEM",
      user_name: name,
      key_phrase,
      roomName
    }
    sendMessage(message)
  }


  const chooseFirstRoom = () => {
    if (!rooms.length) { return }
    selectRoom({ target: { value: rooms[0]._id }})
  }


  useEffect(loadContexts, [])
  useEffect(getTeacherRooms, [])
  useEffect(defineRoomName, [setRoomName, rooms.length])
  useEffect(setMessageListeners, [treatMessageListener])
  useEffect(login, [roomName, sendMessage, user])
  useEffect(chooseFirstRoom, [rooms.length])


  if (error) {
    throw new Error(error)
  }


  const options = rooms.map(({ _id, name }) => (
    // ignore: activities, members, editable, current
    <option
      key={_id}
      value={_id}
    >
      {name}
    </option>
  ))
  options.push(
    <option
      key="__new_class__"
      value="__new_class__"
    >
      {t("teacher.new-class")}
    </option>
  )


  const selected = (!selectedRoom)
    ? (options.length === 1)
      ? "__new_class__"
      : options[0].props.value
    : selectedRoom


  const memberList = getRoomMembers(selectedRoom)
    .map(({
      _id,
      editable,
      current,
      name,
      key_phrase
    }) => {
      const className = (editable)
        ? null
        : "disabled"

      if (editable) {
        const nameChanged = current.name !== name
        current.edited = nameChanged
                      || current.key_phrase !== key_phrase
        current.nameChanged = nameChanged
      }
      const editProps = { editable, current, handleEdit }

      return (
        <li
          key={_id}
          data-id={_id}
          className={className}
        >
          <input
            type="text"
            data-type="name"
            value={current.name}
            onChange={updateValue}
          />
          <input
            type={editable ? "text" : "password"}
            data-type="key_phrase"
            value={current.key_phrase}
            onChange={updateValue}
          />
          <EditButtons {...editProps}/>
          <button
            onClick={deleteMember}
          >
            ❌
          </button>
        </li>
      //  ✅ 🚫💾↩️↗️👍👎⌛✏️
    )})


  return (
    <>
      <h1>{t("teacher.management.classroom")}</h1>
      <label>
        <p>{t("choose-class")}</p>
        <select
          value={selected}
          onChange={selectRoom}
        >
          {options}
        </select>
        <span />
      </label>
      <ul
        className="members"
      >
        {memberList}
      </ul>
      <Growler message={growl} />
    </>
  )
}