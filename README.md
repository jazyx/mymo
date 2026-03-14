# Stem Cell #

This Vite template provides a minimal React setup to `import()` modules on-the-fly as needed. It is called `StemCell` because it can be made to evolve into any custom project that you want.

To customize:

1. Replace the JSX files in `src/modules/` and `src/state/dynamic/` with the files required for your own project
2. Update `public/modules-available.json` to refer to the modules you have placed in `src/modules/`
   ```json
   [
     {
      "path": "./modules/ModuleName.jsx",
      "label": "Name to Show on Link",
      "route": "/route-to-show-in-address-bar"
     }, ...
   ]
   ```

Alternatively, if you are working with a backend, your can set the `MODULES_API` constant in `src/state/ModulesContext.jsx` to an API endpoint in your backend which will provide the same JSON data.

## Working with Contexts

Look at `src/modules/Counter.jsx` and `src/state/dynamic/CounterContext.jsx` to see how a module can request that one or more Contexts and their Providers be inserted into the component tree, so that the state of the module can be preserved throughout the current session.

Place all dynamic contexts in the `src/state/dynamic/` folder, where they will be found by the `src/moduleLoaders.js` script.

## Error handling

This repo contains three modules designed for testing how errors are handled in `ErrorBoundary.jsx`

* BuggyModule.jsx will crash with an internal error after 3s
* __NetworkError__.jsx will trigger a simulated network error
* MissingModule.jsx does not exist and cannot be imported
  
Also:

* Counter.jsx requests a Context. If you alter the path of the requested context, to (for example)...

  ```javascript
  const CONTEXTS = ["./state/dynamic/MissingContext.jsx"]
  ```
  ... this will also provoke an error which is caught in `ErrorBoundary.jsx`.