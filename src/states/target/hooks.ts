import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, AppState } from "states"
import { updateTargetRatesAction } from "./actions"
import { TargetState } from "./types"

export function useTargetRates() {
  const dispatch = useDispatch<AppDispatch>()
  const targetRates = useSelector<AppState, TargetState>(
    (state: AppState): TargetState => state.target
  )

  const updateTargetRates = (
    economicsRate: number,
    sustainabilityRate: number,
    reliabilityRate: number
  ): void => {
    dispatch(
      updateTargetRatesAction({
        economicsRate,
        sustainabilityRate,
        reliabilityRate,
      })
    )
  }

  return { targetRates, updateTargetRates }
}
