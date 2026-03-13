/**
 * src/modules/index.js
 */

export default Object.assign(
  {},
  import.meta.glob('./**/*.jsx')
)