/**
 * src/routes/Nav.jsx
 */


import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getContextValues } from '../state'
import { Icon } from '../component/MenuIcon'
import "../css/nav.css"


const AUTO_CLOSE_MENU_DELAY = 2000 // ms


export const Nav = () => {
  const location = useLocation()
  const { modulesAvailable } = getContextValues("ModulesContext")
  const [ open, setOpen  ] = useState(true)
  const navRef = useRef()


  const toggleOpen = isOpen => {
    if (typeof isOpen !== "boolean") {
      isOpen = !open
    }
    setOpen(isOpen)


    if (isOpen) {
      // Prepare to close the menu if the user clicks outside it
      // or on the hamburger icon

      const autoCloseMenu = ({target}) => {
        const nav = navRef.current
        if ( target === nav
        || (target.tagName === "A" && nav.contains(target))
          ) {
            return
          }

        closeMenu(0)
        document.body.removeEventListener("mousedown", autoCloseMenu)
      }
      document.body.addEventListener("mousedown", autoCloseMenu)
    }
  }


  const closeMenu = delay => {
    if (isNaN(delay)) { // called by useEffect after initial mount
      delay = AUTO_CLOSE_MENU_DELAY
    }
    setTimeout(() => toggleOpen(false), delay)
  }


  const links = modulesAvailable.map(({ label, route }) => {
    const itemClass = (route === location.pathname)
      ? "selected"
      : null


    return (
      <li
        key={route}
        className={itemClass}
      >
        <Link
          to={route}
        >
          {label}
        </Link>
      </li>
    )
  })


  const navClass = (open)
    ? null
    : "closed"


  useEffect(closeMenu, [])


  return (
    <nav
      className={navClass}
      ref={navRef}
    >
      <Icon
        toggleOpen={toggleOpen}
      />
      <ul>
        {links}
      </ul>
    </nav>
  )
}