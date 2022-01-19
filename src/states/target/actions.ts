import { createAction } from "@reduxjs/toolkit"
import { TargetState } from "./types"

export const updateTargetAction = createAction<TargetState>(
  "target/updateTargetAction"
)
