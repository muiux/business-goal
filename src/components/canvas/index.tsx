import React, { useEffect } from "react"

import { Point, Props } from "./types"
import {
  buildTriangle,
  drawRegion,
  drawTarget,
  drawText,
  generateGoalRegions,
  getEdgeMiddlePosition,
  isInsideCircle,
  isInsidePolygon,
  percentageFormatter,
} from "./utils"

import ArrowImage from "assets/images/arrow.png"

import "./index.css"
import { useTargetRates } from "states/target/hooks"

let canvasDOM: HTMLCanvasElement

const Canvas: React.FC<Props> = ({
  radius = 220,
  vertexRadius = 50,
  targetRadius = 5,
}): JSX.Element => {
  const width: number =
    Math.sqrt(Math.pow(radius, 2) - Math.pow(radius / 2, 2)) * 2
  const height: number = radius * 1.5

  let moving: boolean = false
  let center: Point = {
    x: width / 2 + vertexRadius,
    y: radius + vertexRadius,
  }
  let targetPoint: Point = center

  const triRegion: Point[] = buildTriangle(radius, center)
  const targetRegion: Point[] = buildTriangle(radius - targetRadius * 2, center)
  const txtPositions: Point[] = getEdgeMiddlePosition(
    buildTriangle(radius - vertexRadius, center)
  )
  const arrowPositions: Point[] = getEdgeMiddlePosition(
    buildTriangle(radius + vertexRadius + 10, center)
  )
  const ratePositions: Point[] = getEdgeMiddlePosition(
    buildTriangle(radius + vertexRadius + 100, center)
  )
  const goalRegions: Point[][] = generateGoalRegions(center, radius)

  const { targetRates, updateTargetRates } = useTargetRates()

  const isRestricted = (point: Point): boolean => {
    const isInsideVertex = targetRegion.some((vertex: Point) =>
      isInsideCircle(point, vertex, vertexRadius)
    )
    if (isInsideVertex) {
      return true
    }

    const isInsideTri = isInsidePolygon(point, targetRegion)
    if (isInsideTri) {
      return false
    }
    return true
  }

  const detectGoal = (point: Point): void => {
    let regionId = 0 //  center of tri
    let newRates = Object.values(targetRates)

    for (let i = 0; i < goalRegions.length; i++) {
      const region = goalRegions[i]
      const isInside = isInsidePolygon(point, region)
      if (isInside) {
        regionId = i + 1
        break
      }
    }

    switch (regionId) {
      case 0: //  center of tri
        newRates = [1 / 3, 1 / 3, 1 / 3]
        break
      case 1: //  tip1
        newRates = [1 / 2, 0, 1 / 2]
        break
      case 2: //  tip2
        newRates = [1 / 2, 1 / 2, 0]
        break
      case 3: //  tip3
        newRates = [0, 1 / 2, 1 / 2]
        break
      case 4: //  edge1
        newRates = [1, 0, 0]
        break
      case 5: //  edge2
        newRates = [0, 1, 0]
        break
      case 6: //  edge3
        newRates = [0, 0, 1]
        break
      default:
        //  unknown
        break
    }
    updateTargetRates(newRates[0], newRates[1], newRates[2])
  }

  const DrawCanvas = (isMoving: boolean): void => {
    if (canvasDOM && canvasDOM.getContext) {
      const ctx: CanvasRenderingContext2D = canvasDOM.getContext(
        "2d"
      ) as CanvasRenderingContext2D

      ctx.clearRect(0, 0, canvasDOM.width, canvasDOM.height)

      drawRegion(ctx, triRegion, "#9fc3f5")

      // goalRegions.forEach((region: Point[]) => {
      //   drawRegion(
      //     ctx,
      //     region,
      //     `rgb(${(Math.random() * 1000) % 255}, ${
      //       (Math.random() * 1000) % 255
      //     }, ${(Math.random() * 1000) % 255})`
      //   )
      // })

      drawText(
        ctx,
        "ENERGY\nTRILEMMA",
        "#005eca",
        "bold 30px sans-serif",
        0,
        center
      )
      ;["ECONOMICS", "RELIABILITY", "SUSTAINABILITY"].forEach(
        (txt: string, index: number) => {
          drawText(
            ctx,
            txt,
            "#00469b",
            "bold 20px sans-serif",
            60 - 60 * index,
            txtPositions[index]
          )
        }
      )

      drawTarget(ctx, targetPoint, targetRadius, isMoving)
    }
  }

  const renderVertex = (
    point: Point,
    radius: number,
    index: number
  ): JSX.Element => (
    <div
      key={index}
      className="vertex"
      style={{
        left: point.x,
        top: point.y,
        width: radius * 2,
        height: radius * 2,
      }}
    >
      {String(index).padStart(2, "0")}
    </div>
  )

  const renderArrow = (edge: Point, index: number): JSX.Element => (
    <img
      key={index}
      className="arrow"
      src={ArrowImage}
      alt="some"
      style={{
        width: radius,
        left: edge.x,
        top: edge.y,
        transform: `translate(-50%, -50%) rotate(${60 + index * 120}deg)`,
      }}
    />
  )

  const renderRate = (point: Point, index: number): JSX.Element => (
    <div
      key={index}
      id={`#rate${index}`}
      className="rate"
      style={{
        left: point.x,
        top: point.y,
        transform: `translate(-50%, -50%) rotate(${60 - index * 60}deg)`,
      }}
    >
      {percentageFormatter(Object.values(targetRates)[index])}
    </div>
  )

  const EventListeners = (): void => {
    if (!canvasDOM) {
      return
    }

    canvasDOM.addEventListener("mousedown", function (e) {
      const mouseX = e.clientX - 1,
        mouseY = e.clientY - 1,
        distance = Math.sqrt(
          Math.pow(mouseX - targetPoint.x, 2) +
            Math.pow(mouseY - targetPoint.y, 2)
        )

      if (distance <= targetRadius) {
        moving = true
      }
    })

    canvasDOM.addEventListener("mouseup", function (e) {
      moving = false
      DrawCanvas(moving)
    })

    canvasDOM.addEventListener("mousemove", function (e) {
      if (moving) {
        if (!isRestricted(targetPoint)) {
          DrawCanvas(moving)
        }
        if (
          !isRestricted({
            x: e.clientX,
            y: e.clientY,
          })
        ) {
          targetPoint = {
            x: e.clientX - 1,
            y: e.clientY - 1,
          }
        }

        detectGoal(targetPoint)
      }
    })
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const dom: HTMLCanvasElement | null = document.getElementById(
        "myCanvas"
      ) as HTMLCanvasElement | null
      if (dom) {
        canvasDOM = dom
        clearInterval(timer)

        DrawCanvas(moving)
        EventListeners()
      }
    }, 100)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="CanvasWrapper">
      <canvas
        id="myCanvas"
        width={width + vertexRadius * 2}
        height={height + vertexRadius * 2}
      >
        Your browser does not support the HTML5 canvas tag.
      </canvas>
      {triRegion.map((vertex: Point, index: number) => {
        return renderVertex(vertex, vertexRadius, index + 1)
      })}
      {arrowPositions.map((edge: Point, index: number) => {
        return renderArrow(edge, index)
      })}
      {ratePositions.map((edge: Point, index: number) => {
        return renderRate(edge, index)
      })}
    </div>
  )
}

export default Canvas
