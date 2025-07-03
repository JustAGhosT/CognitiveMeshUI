"use client"
import { useState, useEffect, useCallback } from "react"
import type { DragPreviewConfig } from "../../types/nexus"

interface DragPreviewProps {
  isVisible: boolean
  draggedItem: { type: "nexus" | "icon"; id: string } | null
  onDrop: (zoneId: string, position: { x: number; y: number }) => void
  config: DragPreviewConfig
  className?: string
}

interface DropZone {
  id: string
  bounds: DOMRect
  type: "dock" | "grid" | "custom"
  isHighlighted: boolean
  canAccept: boolean
}

export default function DragPreview({
  isVisible,
  draggedItem,
  onDrop,
  config,
  className = "",
}: DragPreviewProps) {
  const [dropZones, setDropZones] = useState<DropZone[]>([])
  const [highlightedZone, setHighlightedZone] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [snapPosition, setSnapPosition] = useState<{ x: number; y: number } | null>(null)

  // Update mouse position
  useEffect(() => {
    if (!isVisible) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [isVisible])

  // Detect drop zones when dragging starts
  useEffect(() => {
    if (!isVisible) {
      setDropZones([])
      setHighlightedZone(null)
      setSnapPosition(null)
      return
    }

    const detectDropZones = () => {
      const zones: DropZone[] = []

      // Find dock zones
      const dockElements = document.querySelectorAll('[data-dock-zone]')
      dockElements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        const zoneId = element.getAttribute('data-dock-zone') || `dock-${zones.length}`
        const zoneType = element.getAttribute('data-zone-type') || 'dock'
        
        zones.push({
          id: zoneId,
          bounds: rect,
          type: zoneType as "dock" | "grid" | "custom",
          isHighlighted: false,
          canAccept: canAcceptDrop(zoneId, draggedItem),
        })
      })

      // Create grid zones for free placement
      if (config.showGrid) {
        const gridZones = createGridZones()
        zones.push(...gridZones)
      }

      setDropZones(zones)
    }

    detectDropZones()
  }, [isVisible, draggedItem, config.showGrid])

  // Check if a zone can accept the dragged item
  const canAcceptDrop = useCallback((zoneId: string, item: { type: "nexus" | "icon"; id: string } | null): boolean => {
    if (!item) return false
    
    // Add logic to determine if zone accepts this item type
    // For now, accept all items
    return true
  }, [])

  // Create grid zones for snapping
  const createGridZones = useCallback((): DropZone[] => {
    const zones: DropZone[] = []
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    const cols = Math.floor(viewport.width / config.gridSize)
    const rows = Math.floor(viewport.height / config.gridSize)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * config.gridSize
        const y = row * config.gridSize
        
        zones.push({
          id: `grid-${row}-${col}`,
          bounds: new DOMRect(x, y, config.gridSize, config.gridSize),
          type: "grid",
          isHighlighted: false,
          canAccept: true,
        })
      }
    }

    return zones
  }, [config.gridSize])

  // Update highlighted zone and snap position
  useEffect(() => {
    if (!isVisible || dropZones.length === 0) return

    const findZoneUnderMouse = () => {
      const zone = dropZones.find(z => 
        z.canAccept &&
        mousePosition.x >= z.bounds.left &&
        mousePosition.x <= z.bounds.right &&
        mousePosition.y >= z.bounds.top &&
        mousePosition.y <= z.bounds.bottom
      )

      if (zone) {
        setHighlightedZone(zone.id)
        
        // Calculate snap position
        if (zone.type === "grid") {
          const snapX = Math.round(mousePosition.x / config.gridSize) * config.gridSize
          const snapY = Math.round(mousePosition.y / config.gridSize) * config.gridSize
          setSnapPosition({ x: snapX, y: snapY })
        } else {
          setSnapPosition({
            x: zone.bounds.left + zone.bounds.width / 2,
            y: zone.bounds.top + zone.bounds.height / 2,
          })
        }
      } else {
        setHighlightedZone(null)
        setSnapPosition(null)
      }
    }

    findZoneUnderMouse()
  }, [mousePosition, dropZones, isVisible, config.gridSize])

  // Handle drop
  const handleDrop = useCallback(() => {
    if (highlightedZone && snapPosition) {
      onDrop(highlightedZone, snapPosition)
    }
  }, [highlightedZone, snapPosition, onDrop])

  // Handle click to drop
  useEffect(() => {
    if (!isVisible) return

    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      handleDrop()
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [isVisible, handleDrop])

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      {/* Grid overlay */}
      {config.showGrid && (
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern
                id="grid-pattern"
                width={config.gridSize}
                height={config.gridSize}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${config.gridSize} 0 L 0 0 0 ${config.gridSize}`}
                  fill="none"
                  stroke="rgba(99, 102, 241, 0.2)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
      )}

      {/* Drop zones */}
      {dropZones.map((zone) => {
        const isHighlighted = highlightedZone === zone.id
        
        return (
          <div
            key={zone.id}
            className={`
              absolute transition-all duration-200
              ${zone.canAccept ? 'pointer-events-auto' : 'pointer-events-none'}
              ${isHighlighted ? 'opacity-100' : 'opacity-0'}
              ${zone.type === 'dock' ? 'border-2 border-dashed' : ''}
              ${zone.type === 'grid' ? 'border border-solid' : ''}
              ${isHighlighted ? `border-${config.highlightColor} bg-${config.highlightColor}/10` : 'border-gray-400'}
              ${zone.type === 'dock' ? 'rounded-lg' : ''}
            `}
            style={{
              left: zone.bounds.left,
              top: zone.bounds.top,
              width: zone.bounds.width,
              height: zone.bounds.height,
            }}
          >
            {/* Drop zone label */}
            {isHighlighted && zone.type === 'dock' && (
              <div className="absolute top-2 left-2 text-xs font-medium text-white bg-black/50 px-2 py-1 rounded">
                Drop Here
              </div>
            )}
          </div>
        )
      })}

      {/* Snap indicator */}
      {snapPosition && (
        <div
          className={`
            absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2
            border-2 border-${config.highlightColor} bg-${config.highlightColor}/20
            rounded-full animate-pulse
            pointer-events-none
          `}
          style={{
            left: snapPosition.x,
            top: snapPosition.y,
          }}
        />
      )}

      {/* Drag instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/70 px-4 py-2 rounded-lg text-sm">
        {highlightedZone ? "Click to drop here" : "Drag to a highlighted zone"}
      </div>

      {/* Crosshair cursor */}
      <div
        className="absolute w-6 h-6 pointer-events-none"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
        }}
      >
        <div className="w-full h-full relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-white/70 transform -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 w-px h-full bg-white/70 transform -translate-x-1/2" />
        </div>
      </div>
    </div>
  )
}