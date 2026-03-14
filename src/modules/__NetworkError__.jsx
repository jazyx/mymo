/**
 * src/modules/__NetworkError__.jsx
 * 
 * For testing purposes.
 * 
 * A hard-coded section in src/routes/RouteWrapper.jsx checks when
 * this module is requested, and replaces the valid `loader`
 * function with a function that (eventually) returns a promise
 * that is reject with an error.
 */

export default () => {
  return (
    <h1>Oops! Why no simulated network error?</h1>
  )
}