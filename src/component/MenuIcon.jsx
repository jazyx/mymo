/**
 * Creates an SVG hamburger menu
 */


export const Icon = ({ toggleOpen }) => (
  <svg
    viewBox="0 0 100 100"
    onClick={toggleOpen}
  >
    <path d="
      M5,20
      L5,80
      H95
      L95,20
      z" opacity="0" />
    <path d="
      M15,10
      H85
      a 10 10 180 0 1 0 20
      H15
      a 10 10 180 0 1 0 -20
      z" />
    <path d="
      M15,40
      H85
      a 10 10 180 0 1 0 20
      H15
      a 10 10 180 0 1 0 -20
      z" />
    <path d="
      M15,70
      H85
      a 10 10 180 0 1 0 20
      H15
      a 10 10 180 0 1 0 -20
      z" />
  </svg>
)