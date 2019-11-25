import React from 'react'
import Draggable from 'react-draggable' // The default

export function DraggableSvg({ x, y, setX, setY, width, height }) {
  return (
    <svg width={width} height={height}>
      <circle x={2} y={2} />
    </svg>
  )
}
