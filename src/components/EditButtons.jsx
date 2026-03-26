/**
 * frontend/src/components/EditButtons.jsx
 */


export default function EditButtons({
  editable,   // boolean
  current,    // { _id, name, key_phrase, edited, fetching }
  handleEdit, // to cancel or apply edits
}) {
  const editButton = () => (
    <button
      onClick={handleEdit}
    >
      ✏️
    </button>
  )


  const twoButtons = () => {
    const className = (current.edited) ? null : "disabled"
    return (
      <>
        <button
          // Remove id and its value from editableState
          onClick={() => handleEdit(current._id, "revert")}
        >
          ↩️
        </button>
        <button
          className={className}
          onClick={() => handleEdit(current._id)}
        >
          ↗️
        </button>
      </>
    )
  }


  const buttons = (!editable)
    ? editButton()
    : (current.fetching) // no onClick listener
      ? <button>⌛</button>
      : twoButtons()


  return (
    <span className="edit-buttons">
      {buttons}
    </span>
  )
}