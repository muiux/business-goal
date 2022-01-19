import { createAction } from "@reduxjs/toolkit"
import { TargetState } from "./types"

export const updateTargetRatesAction = createAction<TargetState>(
  "target/updateTargetRatesAction"
)
