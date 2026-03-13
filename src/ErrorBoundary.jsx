/**
 * src/errorBoundary/ErrorBoundary.jsx
 */


import { Component } from 'react'
import { getContextValues } from './state';


export function ErrorBoundary(props) {
  const { children } = props
  const {
    hideBadLink,
    history
  } = getContextValues("ModulesContext")
  const { label, route } = (history[0] || {}) // not undefined?

  props = { ...props, label, hideBadLink }

  return (
    <ErrorBoundaryClass
      key={route}
      fallback={ error => (
        <ErrorFallback error={error} {...props} />
      )}
    >
      {children}
    </ErrorBoundaryClass>
  );
}


class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    const { error } = this.state

    if (error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(error)
      }

      return this.props.fallback || <h1>Something went wrong.</h1>
    }

    return this.props.children
  }
}


/**
 * Distinguish cases depending on error message
 * @param {object} props (see below)
 * @returns 
 */
const ErrorFallback = props => {
  const {
    error,              // from ErrorBoundaryClass
    resetBoundaryError,
    hideBadLink,        // read from ModulesContext
    label               // read from ModulesContext.history
  } = props


  let message
  if (error.message === "loader is not a function") {
    return MissingModule(label, hideBadLink)

  } else if (error?.message?.includes(
      "dynamically imported module"
  )) {
    return NetworkError(label, resetBoundaryError, hideBadLink)

  } else if (error?.message?.includes("is undefined")
          || error?.message?.includes("Cannot destructure")) {
    return MissingContext(label)

  } else {
    return <CrashError {...props}
    />
  }

  return <h2>{message}</h2>
}


const MissingModule = (label, hideBadLink)=> {
  const message = `Unknown module "${label}".`

  return (
    <>
      <h2>{message}</h2>
      <button
        onClick={hideBadLink}
      >
        Delete Link to {label}
      </button>
    </>
  )
}


const NetworkError = (label, hideBadLink, resetBoundaryError) => {
  const message = `Failed to load module. The link for ${label} has been removed.`
  
  return (
    <>
      <h2>{message}</h2>
      <button
        onClick={resetBoundaryError}
      >
        Try Again
      </button>
      <button
        onClick={hideBadLink}
      >
        Delete Link to {label}
      </button>
    </>
  )
}


const MissingContext = (label) => {
  // TODO: Decide how to handle a missing context
  const message = `Missing context for module: ${label}`
  return (
    <>
      <h2>{message}</h2>
    </>
  )
}


const CrashError = ({
  label, 
  boundaryError,
  resetBoundaryError,
  hideBadLink,
  link
}) => {
  const times = ([
    " ", // Use a space to be truthy. Use trimEnd() to remove it.
    " again",
    " a third time"
  ][boundaryError]) || " too many times"
  const message = `Module "${label}" crashed${times.trimEnd()}.`

  if (boundaryError < 3) {
    return (
      <>
        <h2>{message}</h2>
        <button
          onClick={resetBoundaryError}
        >
          Try Again
        </button>
      </>
    )
  } else {
    return (
      <>
        <h2>{message}</h2>
        <button
          onClick={() => hideBadLink(link)}
        >
          Delete Link
        </button>
        <span> or choose a different module.</span>
      </>
    )
  }
}