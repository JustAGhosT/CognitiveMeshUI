"use client"
import { useEffect, useState, useCallback } from "react"
import type { DragState } from "@/types/nexus"

interface DragPreviewProps {
  dragState: DragState
  onDropZoneEnter: (zoneId: string) => void
  onDropZoneLeave: () => void
  className?: string
}

interface DropZoneRect {
  id: string
  x: number
  y: number
  width: number
  height: number
  isActive: boolean
}

export default function DragPreview({
  dragState,
  onDropZoneEnter,
  onDropZoneLeave,
  className = "",
}: DragPreviewProps) {
  const [dropZones, setDropZones] = useState<DropZoneRect[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Grid settings
  const GRID_SIZE = 20
  const HIGHLIGHT_COLOR = "cyan"

  // Generate drop zones based on screen grid
  const generateDropZones = useCallback(() => {
    if (!dragState.showPreviewGrid) return []

    const zones: DropZoneRect[] = []
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    
    // Create grid of potential drop zones
    const cols = Math.floor(screenWidth / 200) // 200px wide zones
    const rows = Math.floor(screenHeight / 150) // 150px tall zones
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * 200 + 50 // Add some margin
        const y = row * 150 + 50
        
        // Skip zones that are too close to edges
        if (x + 200 > screenWidth - 50 || y + 150 > screenHeight - 50) continue
        
        zones.push({
          id: `zone-${row}-${col}`,
          x,
          y,
          width: 180,
          height: 130,
          isActive: false,
        })
      }
    }
    
    return zones
  }, [dragState.showPreviewGrid])

  // Update drop zones when drag state changes
  useEffect(() => {
    if (dragState.showPreviewGrid) {
      const zones = generateDropZones()
      setDropZones(zones)
    } else {
      setDropZones([])
    }
  }, [dragState.showPreviewGrid, generateDropZones])

  // Track mouse position for highlighting
  useEffect(() => {
    if (!dragState.isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      
      // Check which drop zone is under cursor
      const hoveredZone = dropZones.find(zone => 
        e.clientX >= zone.x && 
        e.clientX <= zone.x + zone.width &&
        e.clientY >= zone.y && 
        e.clientY <= zone.y + zone.height
      )
      
      if (hoveredZone && dragState.activeDropZone !== hoveredZone.id) {
        onDropZoneEnter(hoveredZone.id)
      } else if (!hoveredZone && dragState.activeDropZone) {
        onDropZoneLeave()
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [dragState.isDragging, dropZones, dragState.activeDropZone, onDropZoneEnter, onDropZoneLeave])

  // Don't render if not dragging
  if (!dragState.showPreviewGrid) return null

  return (
    <div className={`fixed inset-0 pointer-events-none z-30 ${className}`}>
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        }}
      />
      
      {/* Drop zones */}
      {dropZones.map((zone) => (
        <div
          key={zone.id}
          className={`
            absolute border-2 border-dashed rounded-lg transition-all duration-200
            ${zone.id === dragState.activeDropZone
              ? `border-${HIGHLIGHT_COLOR}-400 bg-${HIGHLIGHT_COLOR}-400/10 shadow-lg shadow-${HIGHLIGHT_COLOR}-500/20`
              : `border-${HIGHLIGHT_COLOR}-600/30 bg-${HIGHLIGHT_COLOR}-600/5`
            }
          `}
          style={{
            left: zone.x,
            top: zone.y,
            width: zone.width,
            height: zone.height,
          }}
        >
          {/* Drop zone indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`
              w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center
              ${zone.id === dragState.activeDropZone
                ? `border-${HIGHLIGHT_COLOR}-400 bg-${HIGHLIGHT_COLOR}-400/20`
                : `border-${HIGHLIGHT_COLOR}-600/50 bg-${HIGHLIGHT_COLOR}-600/10`
              }
            `}>
              <div className={`
                w-2 h-2 rounded-full
                ${zone.id === dragState.activeDropZone
                  ? `bg-${HIGHLIGHT_COLOR}-400 animate-pulse`
                  : `bg-${HIGHLIGHT_COLOR}-600/50`
                }
              `} />
            </div>
          </div>
          
          {/* Zone label */}
          {zone.id === dragState.activeDropZone && (
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className={`
                px-2 py-1 rounded text-xs font-medium
                bg-${HIGHLIGHT_COLOR}-500/20 text-${HIGHLIGHT_COLOR}-400
                border border-${HIGHLIGHT_COLOR}-500/30
              `}>
                Drop Zone
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* Snap feedback indicator */}
      {dragState.activeDropZone && (
        <div 
          className="absolute pointer-events-none"
          style={{
            left: mousePosition.x - 10,
            top: mousePosition.y - 10,
          }}
        >
          <div className={`
            w-5 h-5 rounded-full border-2 animate-ping
            border-${HIGHLIGHT_COLOR}-400 bg-${HIGHLIGHT_COLOR}-400/30
          `} />
        </div>
      )}
      
      {/* Drag item preview */}
      {dragState.draggedItem && (
        <div 
          className="absolute pointer-events-none"
          style={{
            left: mousePosition.x - 30,
            top: mousePosition.y - 30,
          }}
        >
          <div className={`
            w-16 h-16 rounded-xl border-2 border-dashed
            border-${HIGHLIGHT_COLOR}-400 bg-${HIGHLIGHT_COLOR}-400/20
            flex items-center justify-center text-${HIGHLIGHT_COLOR}-400
            backdrop-blur-sm
          `}>
            <div className="text-xs font-medium">
              {dragState.draggedItem.type.toUpperCase()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Utility functions for drop zone calculations
export const calculateDropZoneCollision = (
  mouseX: number,
  mouseY: number,
  zones: DropZoneRect[]
): DropZoneRect | null => {
  return zones.find(zone => 
    mouseX >= zone.x && 
    mouseX <= zone.x + zone.width &&
    mouseY >= zone.y && 
    mouseY <= zone.y + zone.height
  ) || null
}

export const snapToGrid = (x: number, y: number, gridSize: number = 20) => ({
  x: Math.round(x / gridSize) * gridSize,
  y: Math.round(y / gridSize) * gridSize,
})