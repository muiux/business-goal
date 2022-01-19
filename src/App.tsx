import React from "react"
import { Provider } from "react-redux"
import store from "states"

import { Canvas } from "components"

const App = () => {
  return (
    <Provider store={store}>
      <Canvas />
    </Provider>
  )
}

export default App
