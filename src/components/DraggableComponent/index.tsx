"use client"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useDragDrop, getSizeConfig } from "@/contexts/DragDropContext"
import { GripVertical, Pin, PinOff, MoreVertical, Minimize2, Square, Maximize2, Monitor } from "lucide-react"

interface DraggableComponentProps {
  id: string
  title: string
  type: string
  children: React.ReactNode
  initialSize?: "small" | "medium" | "large" | "x-large"
  initialPosition?: { x: number; y: number }
  className?: string
  allowResize?: boolean
  allowDock?: boolean
  isDocked?: boolean
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({
  id,
  title,
  type,
  children,
  initialSize = "medium",
  initialPosition = { x: 100, y: 100 },
  className = "",
  allowResize = true,
  allowDock = true,
  isDocked: propIsDocked = false,
}) => {
  const {
    items,
    isDragging,
    draggedItem,
    startDrag,
    undockItem,
    bringToFront,
    activeDockZone,
    registerItem,
    updateItemSize,
    snapToGrid,
    showGrid,
    globalSize,
    dockZones,
    dockItem,
  } = useDragDrop()

  const componentRef = useRef<HTMLDivElement>(null)
  const [showControls, setShowControls] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragHovered, setIsDragHovered] = useState(false)

  const item = items[id]
  const effectiveSize = globalSize || item?.size || initialSize
  const sizeConfig = getSizeConfig(effectiveSize)
  const isBeingDragged = draggedItem?.id === id
  const isInActiveDockZone = activeDockZone && isBeingDragged
  const isDocked = item?.isDocked || propIsDocked

  // Register item on mount
  useEffect(() => {
    if (!item) {
      registerItem({
        id,
        type,
        size: initialSize,
        position: initialPosition,
        isDocked: propIsDocked,
        zIndex: 100,
      })
    }
  }, [id, type, initialSize, initialPosition, item, registerItem, propIsDocked])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (item) {
      startDrag(item, e)
    }
  }

  const handleSizeChange = (newSize: "small" | "medium" | "large" | "x-large") => {
    updateItemSize(id, newSize)
    setShowControls(false)
  }

  const handleDockToggle = () => {
    if (item?.isDocked) {
      undockItem(id)
    } else {
      // If not docked, try to dock to the first available zone
      const availableZones = Object.entries(dockZones).filter(
        ([zoneId, zone]) =>
          (!zone.maxItems || zone.items.length < zone.maxItems) &&
          (!zone.allowedSizes || zone.allowedSizes.includes(effectiveSize)),
      )

      if (availableZones.length > 0) {
        dockItem(id, availableZones[0][0])
      }
    }
    setShowControls(false)
  }

  const handleBringToFront = () => {
    bringToFront(id)
  }

  if (!item) return null

  const dragTransform = isBeingDragged ? "scale(1.05) rotate(1deg)" : ""
  const hoverTransform = isHovered && !isBeingDragged ? "scale(1.02)" : ""

  return (
    <>
      {/* Grid overlay when enabled and not docked */}
      {showGrid && !isDocked && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />
      )}

      <div
        ref={componentRef}
        className={`
          backdrop-blur-md bg-slate-900/60 border rounded-xl shadow-2xl
          transition-all duration-300 group select-none
          ${isDocked ? "relative w-full border-slate-500/30" : "fixed border-cyan-500/30"}
          ${isBeingDragged ? "shadow-cyan-500/50 border-cyan-500/70 z-50" : ""}
          ${isInActiveDockZone ? "border-green-500/70 shadow-green-500/30 bg-green-900/20" : ""}
          ${isDragging && !isBeingDragged ? "pointer-events-none opacity-50" : ""}
          ${!isDocked ? "cursor-move" : ""}
          ${isDragHovered ? "ring-2 ring-cyan-400/50" : ""}
          ${className}
        `}
        style={{
          left: isDocked ? "auto" : item.position.x,
          top: isDocked ? "auto" : item.position.y,
          zIndex: item.zIndex,
          width: isDocked ? "auto" : sizeConfig.width,
          height: isDocked ? "auto" : sizeConfig.height,
          transform: `${dragTransform} ${hoverTransform}`,
          cursor: !isDocked ? (isBeingDragged ? "grabbing" : "grab") : "default",
        }}
        onMouseEnter={() => {
          setIsHovered(true)
          setIsDragHovered(true)
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          setShowControls(false)
          setIsDragHovered(false)
        }}
        onClick={handleBringToFront}
      >
        {/* Enhanced Drag Handle Header - Redesigned and Compact */}
        <div
          className={`
    flex items-center justify-between px-3 py-1.5 border-b border-slate-700/50 
    ${isDocked ? "cursor-default" : "cursor-grab hover:cursor-grab active:cursor-grabbing"}
    bg-gradient-to-r from-slate-800/50 to-slate-700/30
    ${isBeingDragged ? "bg-gradient-to-r from-cyan-800/30 to-blue-800/30" : ""}
    ${isDragHovered && !isDocked ? "bg-gradient-to-r from-cyan-800/20 to-blue-800/20 cursor-grab" : ""}
    transition-all duration-200
  `}
          onMouseDown={handleMouseDown}
          style={{ cursor: !isDocked ? "grab" : "default" }}
        >
          <div className="flex items-center space-x-2">
            {/* Enhanced Drag Handle */}
            <div className="flex items-center space-x-1 p-1 rounded transition-all duration-200 hover:bg-cyan-500/20">
              <GripVertical
                size={12}
                className={`transition-colors ${
                  isBeingDragged ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400"
                }`}
              />
            </div>

            {/* Redesigned Dock/Undock Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDockToggle()
              }}
              className={`
      p-1.5 rounded-md transition-all duration-300 cursor-pointer
      ${
        isDocked
          ? "bg-slate-700/50 text-cyan-400 hover:bg-slate-600/50 hover:text-cyan-300"
          : "bg-slate-800/30 text-slate-500 hover:bg-slate-700/50 hover:text-slate-400"
      }
    `}
              title={isDocked ? "Component is docked - Click to undock" : "Click to dock component"}
            >
              {isDocked ? <Pin size={12} className="text-cyan-400" /> : <PinOff size={12} />}
            </button>

            <h3 className="font-semibold text-white text-xs">{title}</h3>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse bg-cyan-400`} />
          </div>

          {/* Enhanced Control Buttons */}
          <div
            className={`flex items-center space-x-1 transition-opacity cursor-pointer ${
              showControls || isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Redesigned Size Controls */}
            {allowResize && (
              <div className="flex items-center bg-slate-800/50 border border-slate-700/50 rounded overflow-hidden">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSizeChange("small")
                  }}
                  className={`p-1 transition-colors cursor-pointer ${
                    effectiveSize === "small"
                      ? "bg-cyan-500/30 text-cyan-400"
                      : "hover:bg-slate-600/50 text-slate-400 hover:text-cyan-400"
                  }`}
                  title="Small"
                >
                  <Minimize2 size={8} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSizeChange("medium")
                  }}
                  className={`p-1 transition-colors cursor-pointer border-x border-slate-600/50 ${
                    effectiveSize === "medium"
                      ? "bg-cyan-500/30 text-cyan-400"
                      : "hover:bg-slate-600/50 text-slate-400 hover:text-cyan-400"
                  }`}
                  title="Medium"
                >
                  <Square size={8} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSizeChange("large")
                  }}
                  className={`p-1 transition-colors cursor-pointer border-r border-slate-600/50 ${
                    effectiveSize === "large"
                      ? "bg-cyan-500/30 text-cyan-400"
                      : "hover:bg-slate-600/50 text-slate-400 hover:text-cyan-400"
                  }`}
                  title="Large"
                >
                  <Maximize2 size={8} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSizeChange("x-large")
                  }}
                  className={`p-1 transition-colors cursor-pointer ${
                    effectiveSize === "x-large"
                      ? "bg-cyan-500/30 text-cyan-400"
                      : "hover:bg-slate-600/50 text-slate-400 hover:text-cyan-400"
                  }`}
                  title="Extra Large"
                >
                  <Monitor size={8} />
                </button>
              </div>
            )}

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowControls(!showControls)
                }}
                className="p-1 rounded hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                <MoreVertical size={10} className="text-slate-400 hover:text-cyan-400" />
              </button>

              {showControls && (
                <div className="absolute top-6 right-0 z-50 backdrop-blur-md bg-slate-900/90 border border-slate-700/50 rounded-lg shadow-xl min-w-28">
                  <div className="p-2 space-y-1">
                    {allowDock && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDockToggle()
                        }}
                        className="w-full flex items-center space-x-2 p-2 hover:bg-slate-700/50 rounded text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        {isDocked ? <PinOff size={10} /> : <Pin size={10} />}
                        <span>{isDocked ? "Undock" : "Dock"}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Component Content */}
        <div className="p-4 h-full overflow-auto">
          <div
            className={`${
              effectiveSize === "small"
                ? "text-sm"
                : effectiveSize === "large"
                  ? "text-base"
                  : effectiveSize === "x-large"
                    ? "text-lg"
                    : "text-sm"
            }`}
          >
            {children}
          </div>
        </div>

        {/* Enhanced Docking Preview Indicator */}
        {isInActiveDockZone && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse shadow-lg">
            Drop to dock
          </div>
        )}

        {/* Snap to grid indicator */}
        {snapToGrid && isBeingDragged && (
          <div className="absolute top-2 right-2 bg-cyan-500/90 text-white px-2 py-1 rounded text-xs font-mono">
            SNAP
          </div>
        )}

        {/* Enhanced Visual Feedback */}
        {isBeingDragged && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none animate-pulse" />
        )}

        {/* Drag Hint for Non-Docked Items */}
        {!isDocked && isDragHovered && !isBeingDragged && (
          <div className="absolute top-2 left-2 bg-cyan-500/90 text-white px-2 py-1 rounded text-xs font-medium animate-pulse">
            Drag to move
          </div>
        )}
      </div>
    </>
  )
}

export default DraggableComponent
