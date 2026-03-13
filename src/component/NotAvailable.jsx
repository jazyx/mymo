/**
 * src/component/NotAvailable.jsx
 * 
 * Workaround for not being able to remove an item from
 * window.history
 * 
 * Placeholder for a route which the user deleted earlier, if the
 * user uses the browser's Back or Forward buttons to revisit it.
 */


import { useLocation } from 'react-router-dom'
import { getContextValues } from '../state'


export const NotAvailable = () => {
  const location = useLocation()
  const { badLinks } = getContextValues("ModulesContext")

  const route = location.pathname + location.hash
  const badLink = badLinks.find( badLink => (
    badLink.route === route
  ))

  const feature = (badLink)
    ? `${badLink.label}`
    : route

  return (
    <div
       style={{ textAlign: "center"}}
    >
      <h2>{`${feature} is not available now.`}</h2>
      <p>Please choose a different activity.</p>
    </div>
  )
}