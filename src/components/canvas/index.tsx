import React, { useEffect } from "react"

import { Point, Props } from "./types"
import { buildTriangle, drawRegion, drawTarget, isInside } from "./utils"

import "./index.css"

const Canvas: React.FC<Props> = ({
  radius = 200,
  vertexRadius = 50,
  targetRadius = 7,
}): JSX.Element => {
  const width: number =
    Math.sqrt(Math.pow(radius, 2) - Math.pow(radius / 2, 2)) * 2
  const height: number = radius * 1.5

  let moving: boolean = false
  let canvasDOM: HTMLCanvasElement
  let center: Point = {
    x: width / 2 + vertexRadius,
    y: radius + vertexRadius,
  }
  let target: Point = center

  const triRegion: Point[] = buildTriangle(radius, center)
  const innerRegion: Point[] = buildTriangle(
    radius - vertexRadius - targetRadius,
    center
  )

  const DrawCanvas = (): void => {
    if (canvasDOM && canvasDOM.getContext) {
      const ctx: CanvasRenderingContext2D = canvasDOM.getContext(
        "2d"
      ) as CanvasRenderingContext2D

      ctx.clearRect(0, 0, canvasDOM.width, canvasDOM.height)

      drawRegion(ctx, triRegion, "#9fc3f5")
      drawTarget(ctx, target, targetRadius)
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
      {index}
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
          Math.pow(mouseX - target.x, 2) + Math.pow(mouseY - target.y, 2)
        )

      if (distance <= targetRadius) {
        moving = true
      }
    })

    canvasDOM.addEventListener("mouseup", function (e) {
      moving = false
    })

    canvasDOM.addEventListener("mousemove", function (e) {
      if (moving) {
        if (isInside(target, innerRegion)) {
          DrawCanvas()
        }
        target = {
          x: e.clientX - 1,
          y: e.clientY - 1,
        }
      }
    })
  }

  useEffect(() => {
    const findDomTimer = setInterval(() => {
      const dom: HTMLCanvasElement | null = document.getElementById(
        "myCanvas"
      ) as HTMLCanvasElement | null
      if (dom) {
        canvasDOM = dom
        clearInterval(findDomTimer)

        DrawCanvas()
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
    </div>
  )
}

export default Canvas
