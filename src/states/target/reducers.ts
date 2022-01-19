import { createReducer } from "@reduxjs/toolkit"
import { updateTargetRatesAction } from "./actions"
import { TargetState } from "./types"

const initialState: TargetState = {
  economicsRate: 1 / 3,
  sustainabilityRate: 1 / 3,
  reliabilityRate: 1 / 3,
}

export default createReducer(initialState, (builder) =>
  builder.addCase(updateTargetRatesAction, (state, action) => {
    state.economicsRate = action.payload.economicsRate
    state.sustainabilityRate = action.payload.sustainabilityRate
    state.reliabilityRate = action.payload.reliabilityRate
  })
)
