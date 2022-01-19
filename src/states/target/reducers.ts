import { createReducer } from "@reduxjs/toolkit"
import { updateTargetAction } from "./actions"
import { TargetState } from "./types"

const initialState: TargetState = {
  sustainabilityRate: 1 / 3,
  economicsRate: 1 / 3,
  reliabilityRate: 1 / 3,
}

export default createReducer(initialState, (builder) =>
  builder.addCase(updateTargetAction, (state, action) => {
    state = action.payload
  })
)
