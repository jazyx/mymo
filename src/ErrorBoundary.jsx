/**
 * src/errorBoundary/ErrorBoundary.jsx
 */


import { Component, useContext } from 'react'
import { useLocation } from "react-router-dom";
import { getContextValues } from './state';


export function ErrorBoundary(props) {
  const location = useLocation()
  const { hideBadLinks } = getContextValues("ModulesContext")
  const { children } = props

  const link = location.pathname + location.hash
  props = { ...props, link, hideBadLinks }

  return (
    <ErrorBoundaryClass
      key={link}
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



const ErrorFallback = props => {
  const {
    label,
    error,
    hideBadLinks,
    link
  } = props

  let message
  if (error.message === "loader is not a function") {
    message = `Unknown module "${label}". The link for ${label} has been removed.`
    hideBadLinks(link)


  } else if (error?.message?.includes("dynamically imported module")) {
    message = `Failed to load module. The link for ${label} has been removed.`
    hideBadLinks(link)

  } else if (error?.message?.includes("is undefined") ||
             error?.message?.includes("Cannot destructure property")) {
    message = `Missing context for module: ${label}`

  } else {
    return <CrashError {...props}
    />
  }

  return <h2>{message}</h2>
}



const CrashError = ({
  label, 
  boundaryError,
  resetBoundaryError,
  hideBadLinks,
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
          onClick={() => hideBadLinks(link)}
        >
          Delete Link
        </button>
        <span> or choose a different module.</span>
      </>
    )
  }
}