/**
 * src/App.jsx
 */


import { HashRouter as Router } from 'react-router-dom'
import { Provider } from './state'
import { Nav, Routing } from './routes'
import { ErrorBoundary } from './ErrorBoundary'


export const App = () => {
  return (
    <Router>
      <Provider>
        <Nav />
        <ErrorBoundary>
          <Routing />
        </ErrorBoundary>
      </Provider>
    </Router>
  )
}