/**
 * src/routes/Nav.jsx
 */


import { Link } from 'react-router-dom'
import { getContextValues } from '../state'


export const Nav = () => {
  const { modulesAvailable } = getContextValues("ModulesContext")
  
  const links = modulesAvailable.map(({ label, route }) => (
    <li
      key={route}
    >
      <Link
        to={route}
      >
        {label}
      </Link>
    </li>
  ))

  return (
    <ul>{links}</ul>
  )
}