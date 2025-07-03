"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import { Mic, Send, Users, Brain, BarChart3, Shield, Pin, PinOff, GripVertical } from "lucide-react"
import { useDragDrop } from "@/contexts/DragDropContext"

interface DraggableNexusProps {
  onPromptSubmit?: (prompt: string) => void
  isVoiceActive?: boolean
  onVoiceToggle?: () => void
  onDock?: () => void
  initialPosition?: { x: number; y: number }
  isDocked?: boolean
}

export default function DraggableNexus({
  onPromptSubmit,
  isVoiceActive = false,
  onVoiceToggle,
  onDock,
  initialPosition = { x: 400, y: 300 },
  isDocked: propIsDocked = false,
}: DraggableNexusProps) {
  const [prompt, setPrompt] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    items,
    isDragging,
    draggedItem,
    startDrag,
    undockItem,
    bringToFront,
    activeDockZone,
    registerItem,
    dockZones,
    dockItem,
  } = useDragDrop()

  const nexusId = "command-nexus"
  const item = items[nexusId]
  const isBeingDragged = draggedItem?.id === nexusId
  const isInActiveDockZone = activeDockZone && isBeingDragged
  const isDocked = item?.isDocked || propIsDocked

  const contextPanels = [
    { icon: Users, label: "Agent Control", color: "cyan" },
    { icon: Brain, label: "Reasoning Engine", color: "blue" },
    { icon: BarChart3, label: "Analytics Hub", color: "purple" },
    { icon: Shield, label: "Security Matrix", color: "green" },
  ]

  const promptSuggestions = ["Deploy Agent", "Security Scan", "Performance Report", "System Status"]

  // Register nexus as draggable item
  useEffect(() => {
    if (!item) {
      registerItem({
        id: nexusId,
        type: "nexus",
        size: "large",
        position: initialPosition,
        isDocked: propIsDocked,
        zIndex: 100,
      })
    }
  }, [item, registerItem, initialPosition, propIsDocked])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault()
        setIsExpanded(true)
        inputRef.current?.focus()
      }
      if (e.key === "Escape") {
        setIsExpanded(false)
        setPrompt("")
        setSuggestions([])
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handlePromptChange = (value: string) => {
    setPrompt(value)
  }

  const handleSubmit = () => {
    if (prompt.trim()) {
      onPromptSubmit?.(prompt)
      setPrompt("")
      setSuggestions([])
      setIsExpanded(false)
    }
  }

  const handleNexusClick = () => {
    if (!isBeingDragged) {
      setIsExpanded(!isExpanded)
      if (!isExpanded) {
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (item) {
      startDrag(item, e)
    }
  }

  const handleDockToggle = () => {
    if (item?.isDocked) {
      undockItem(nexusId)
    } else {
      // Try to dock to the first available zone
      const availableZones = Object.entries(dockZones).filter(
        ([zoneId, zone]) =>
          (!zone.maxItems || zone.items.length < zone.maxItems) &&
          (!zone.allowedSizes || zone.allowedSizes.includes("large")),
      )

      if (availableZones.length > 0) {
        dockItem(nexusId, availableZones[0][0])
      }
    }
  }

  const handleBringToFront = () => {
    bringToFront(nexusId)
  }

  if (!item) return null

  const dragTransform = isBeingDragged ? "scale(1.05) rotate(1deg)" : ""
  const hoverTransform = isHovered && !isBeingDragged ? "scale(1.02)" : ""

  return (
    <>
      {/* Semi-opaque overlay when expanded and not docked */}
      {isExpanded && !isDocked && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40" onClick={() => setIsExpanded(false)} />
      )}

      {/* Nexus Container */}
      <div
        className={`
          backdrop-blur-md bg-slate-900/90 border-2 rounded-2xl shadow-2xl 
          transition-all duration-500 select-none
          ${isDocked ? "relative w-full border-slate-500/30" : "fixed border-slate-700/50"}
          ${isBeingDragged ? "shadow-cyan-500/50 border-cyan-500/70 z-50" : ""}
          ${isInActiveDockZone ? "border-green-500/70 shadow-green-500/30 bg-green-900/20" : ""}
          ${isDragging && !isBeingDragged ? "pointer-events-none opacity-50" : ""}
          ${!isDocked ? "cursor-move" : ""}
          ${isExpanded ? "z-50" : "z-10"}
        `}
        style={{
          left: isDocked ? "auto" : item.position.x,
          top: isDocked ? "auto" : item.position.y,
          zIndex: item.zIndex,
          width: isDocked ? "auto" : isExpanded ? 500 : 400,
          height: isDocked ? "auto" : isExpanded ? 320 : 120,
          transform: `${dragTransform} ${hoverTransform}`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleBringToFront}
      >
        {/* Draggable Header */}
        <div
          className={`
            flex items-center justify-between px-4 py-2 border-b border-slate-700/50
            ${isDocked ? "cursor-default" : "cursor-grab hover:cursor-grab active:cursor-grabbing"}
            bg-gradient-to-r from-slate-800/50 to-slate-700/30
            ${isBeingDragged ? "bg-gradient-to-r from-cyan-800/30 to-blue-800/30" : ""}
            transition-all duration-200
          `}
          onMouseDown={handleMouseDown}
          style={{ cursor: !isDocked ? "grab" : "default" }}
        >
          <div className="flex items-center space-x-2">
            {/* Drag Handle */}
            <div className="flex items-center space-x-1 p-1 rounded transition-all duration-200 hover:bg-cyan-500/20">
              <GripVertical
                size={14}
                className={`transition-colors ${
                  isBeingDragged ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400"
                }`}
              />
            </div>

            {/* Pin Icon for Docked State */}
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
              title={isDocked ? "Nexus is docked - Click to undock" : "Click to dock nexus"}
            >
              {isDocked ? <Pin size={12} className="text-cyan-400" /> : <PinOff size={12} />}
            </button>

            <h3 className="font-semibold text-white text-sm">Command Nexus</h3>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNexusClick()
            }}
            className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-xs text-slate-300 hover:text-white transition-all duration-200"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>

        {/* Energy Ring */}
        <div
          className={`
            absolute -inset-1 rounded-2xl opacity-50
            bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20
            ${isExpanded ? "animate-spin-slow" : ""}
          `}
        />

        <div className="relative p-6 h-full flex flex-col">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              COMMAND NEXUS
            </div>
            {!isExpanded && (
              <div>
                <div className="text-sm text-slate-400 mb-2">Central Command Interface • Click expand to use</div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-xs text-cyan-400">Neural Link Active</span>
                </div>
              </div>
            )}
          </div>

          {/* Expanded Interface */}
          {isExpanded && (
            <div className="flex-1 space-y-4">
              {/* Command Input */}
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={prompt}
                  onChange={(e) => handlePromptChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Enter AI command... (Ctrl+Space)"
                  className="w-full bg-slate-800/50 text-white placeholder-slate-400 
                    text-lg outline-none p-4 rounded-xl border border-slate-700/50
                    focus:border-cyan-500/50 transition-all duration-300"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onVoiceToggle}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                      isVoiceActive
                        ? "bg-red-500/20 text-red-400 animate-pulse"
                        : "bg-slate-700/50 text-slate-400 hover:text-cyan-400 hover:bg-slate-600/50"
                    }`}
                  >
                    <Mic size={16} />
                    <span className="text-sm">Hey Mesh</span>
                  </button>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim()}
                  className="px-6 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 
                    hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 flex items-center space-x-2"
                >
                  <Send size={16} />
                  <span>Execute</span>
                </button>
              </div>

              {/* Contextual Command Chips */}
              <div className="flex flex-wrap gap-2">
                {promptSuggestions.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setPrompt(chip.toLowerCase())}
                    className="px-3 py-1 text-xs bg-slate-700/50 text-slate-300 
                      rounded-full hover:bg-cyan-500/20 hover:text-cyan-400 
                      transition-all duration-200"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/50">
                <span>Cognitive Mesh Command Interface</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Neural Network Active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side Icons (when not expanded and not docked) */}
        {!isExpanded && !isDocked && (
          <>
            {/* Left Side Icons */}
            <div className="absolute left-0 top-1/2 transform -translate-x-20 -translate-y-1/2 space-y-4">
              {contextPanels.slice(0, 2).map((panel) => {
                const Icon = panel.icon
                return (
                  <button
                    key={panel.label}
                    className={`
                      w-14 h-14 backdrop-blur-md bg-slate-900/80 
                      border border-${panel.color}-500/50 rounded-xl
                      flex items-center justify-center cursor-pointer
                      transition-all duration-300 hover:scale-110
                      hover:shadow-${panel.color}-500/30 hover:border-${panel.color}-400
                    `}
                  >
                    <Icon size={22} className={`text-${panel.color}-400`} />
                  </button>
                )
              })}
            </div>

            {/* Right Side Icons */}
            <div className="absolute right-0 top-1/2 transform translate-x-20 -translate-y-1/2 space-y-4">
              {contextPanels.slice(2, 4).map((panel) => {
                const Icon = panel.icon
                return (
                  <button
                    key={panel.label}
                    className={`
                      w-14 h-14 backdrop-blur-md bg-slate-900/80 
                      border border-${panel.color}-500/50 rounded-xl
                      flex items-center justify-center cursor-pointer
                      transition-all duration-300 hover:scale-110
                      hover:shadow-${panel.color}-500/30 hover:border-${panel.color}-400
                    `}
                  >
                    <Icon size={22} className={`text-${panel.color}-400`} />
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Enhanced Docking Preview Indicator */}
        {isInActiveDockZone && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse shadow-lg">
            Drop to dock nexus
          </div>
        )}

        {/* Enhanced Visual Feedback */}
        {isBeingDragged && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none animate-pulse" />
        )}
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
      `}</style>
    </>
  )
}

export { DraggableNexus }
export type { DraggableNexusProps }
