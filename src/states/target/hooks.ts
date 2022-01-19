import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, AppState } from "states"
import { updateTargetAction } from "./actions"
import { TargetState } from "./types"

export function useRates() {
  const dispatch = useDispatch<AppDispatch>()
  const target = useSelector<AppState, TargetState>(
    (state: AppState): TargetState => state.target
  )

  const updateTarget = (
    economicsRate: number,
    sustainabilityRate: number,
    reliabilityRate: number
  ): void => {
    dispatch(
      updateTargetAction({
        economicsRate,
        sustainabilityRate,
        reliabilityRate,
      })
    )
  }

  return [target, updateTarget]
}
