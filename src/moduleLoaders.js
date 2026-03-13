/**
 * src/modules/index.js
 */

export default Object.assign(
  {},
  import.meta.glob('./modules/**/*.jsx'),
  import.meta.glob('./state/dynamic/**/*.jsx')
)