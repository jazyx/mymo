/**
 * frontend/src/pages/Home.jsx
 * 
 * This is a static component, downloaded as part of the initial
 * minimal bundle. It is installed with the Route path "/", and is
 * always available.
 * 
 * For now, it just shows a button to connect to Room "Thursday".
 * 
 * In the future, it will give a brief description of what is
 * possible on this site, and provide (dynamically-imported)
 * single-player activities which require no login.
 * 
 * It will also provide (dynamically-imported) links to:
 * 
 * • Log in as a registered teacher
 * • Log in as a registered student
 * • Start a trial as a school/teacher
 */


import { Link } from 'react-router-dom'
import '../css/home.css'


export default function Home() {
  return (
    <div id="home">
      <Link
        to="/room/Thursday"
        draggable="false"
      >
        Thursday
      </Link>
    </div>
  )
}