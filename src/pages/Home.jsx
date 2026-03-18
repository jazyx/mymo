/**
 * frontend/src/pages/Home.jsx
 */


import { Link } from 'react-router-dom'
import '../css/home.css'


export default function Home(props) {


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