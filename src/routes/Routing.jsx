/**
 * src/routes/Router.jsx
 */


import { 
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import { getContextValues } from '../state'
import { RouteWrapper } from './RouteWrapper'
import { NotAvailable } from '../component/NotAvailable'



export const Routing = (props) => {
  const {
    modulesAvailable,
    setRouteAndLabel
  } = getContextValues("ModulesContext")


  let routes = modulesAvailable.map( moduleData => {
    const { route } = moduleData // path, label

    return (
      <Route
        key={route}
        path={route}
        element={
          <RouteWrapper
            {...moduleData}
            setRouteAndLabel={setRouteAndLabel}
          />
        }
      />
    )
  })

  // <<< HACK
  // The NotAvailable component will be shown momentarily if the
  // user starts a visit with a dynamic route. The dynamic route
  // should be shown as soon as it becomes available.
  //
  // NotAvailable will also be shown if
  // * The user previously visited a broken link,
  // * Navigated somewhere else
  // * Visited the broken link again
  // * Chose to delete the broken link
  // * Used the browser's Back button to return to the previously
  //   visited route.
  // 
  // In this case, NotAvailable will show a message that the
  // broken link is not currently available, and a recommendation
  // to choose a different activity.
  //
  // This is not an ideal solution, but it is impossible to remove
  // an item from window.history, and it's better to show a message
  // than an inexplicably empty page.

  routes.push(
    <Route
      key="home"
      path="*"
      element={
        <NotAvailable/>
      }
    />
  )
  // HACK >>>


  return <Routes>{routes}</Routes>
}