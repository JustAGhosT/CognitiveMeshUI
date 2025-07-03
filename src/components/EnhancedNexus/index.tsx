"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { Mic, Send, Users, Brain, BarChart3, Shield, Pin, Maximize2, Minimize2, Move } from "lucide-react"
import { useAudioSystem } from "@/hooks/useAudioSystem"
import OrbitalIcons from "./OrbitalIcons"
import DragPreview from "./DragPreview"
import type { NexusModule, NexusState, DragState, IconPosition } from "@/types/nexus"

interface EnhancedNexusProps {
  onPromptSubmit?: (prompt: string) => void
  isVoiceActive?: boolean
  onVoiceToggle?: () => void
  onDock?: () => void
  initialPosition?: { x: number; y: number }
  soundVolume?: number
}

export default function EnhancedNexus({
  onPromptSubmit,
  isVoiceActive = false,
  onVoiceToggle,
  onDock,
  initialPosition = { x: 400, y: 300 },
  soundVolume = 0.7,
}: EnhancedNexusProps) {
  const [prompt, setPrompt] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const nexusRef = useRef<HTMLDivElement>(null)

  // Audio system
  const { audioState, playSound, setVolume } = useAudioSystem(soundVolume)

  // Enhanced state management
  const [nexusState, setNexusState] = useState<NexusState>({
    isExpanded: true, // Start expanded to showcase features
    expandSize: "medium",
    isPinned: true,
    isDocked: false,
    isFloating: false,
    activeModule: null,
    position: initialPosition,
    size: { width: 400, height: 120 },
  })

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    showPreviewGrid: false,
    activeDropZone: null,
  })

  const [iconPositions, setIconPositions] = useState<IconPosition[]>([])

  // Define available modules
  const availableModules: NexusModule[] = [
    { 
      id: "agent-control", 
      label: "Agent Control", 
      icon: Users, 
      color: "cyan",
      header: "Agent Control Center",
      description: "Manage AI agents and their tasks"
    },
    { 
      id: "reasoning-engine", 
      label: "Reasoning Engine", 
      icon: Brain, 
      color: "blue",
      header: "Reasoning Engine",
      description: "Advanced cognitive processing"
    },
    { 
      id: "analytics-hub", 
      label: "Analytics Hub", 
      icon: BarChart3, 
      color: "purple",
      header: "Analytics Hub",
      description: "Data insights and metrics"
    },
    { 
      id: "security-matrix", 
      label: "Security Matrix", 
      icon: Shield, 
      color: "green",
      header: "Security Matrix",
      description: "Security monitoring and control"
    },
  ]

  const promptSuggestions = ["Deploy Agent", "Security Scan", "Performance Report", "System Status"]

  // Update audio volume when prop changes
  useEffect(() => {
    setVolume(soundVolume)
  }, [soundVolume, setVolume])

  // Size calculations based on expand state
  const calculateSize = useCallback(() => {
    if (!nexusState.isExpanded) {
      return { width: 400, height: 120 }
    }
    
    const baseHeight = 320
    const heightMultiplier = nexusState.expandSize === "small" ? 1 : 
                            nexusState.expandSize === "medium" ? 1.4 : 1.8
    
    return {
      width: nexusState.expandSize === "small" ? 450 : 
             nexusState.expandSize === "medium" ? 500 : 600,
      height: baseHeight * heightMultiplier
    }
  }, [nexusState.isExpanded, nexusState.expandSize])

  // Update size when state changes
  useEffect(() => {
    const newSize = calculateSize()
    setNexusState(prev => ({ ...prev, size: newSize }))
  }, [calculateSize])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault()
        setNexusState(prev => ({ ...prev, isExpanded: true }))
        setTimeout(() => inputRef.current?.focus(), 100)
      }
      if (e.key === "Escape") {
        setNexusState(prev => ({ ...prev, isExpanded: false }))
        setPrompt("")
        setSuggestions([])
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Event handlers
  const handlePromptChange = (value: string) => {
    setPrompt(value)
  }

  const handleSubmit = () => {
    if (prompt.trim()) {
      onPromptSubmit?.(prompt)
      setPrompt("")
      setSuggestions([])
      setNexusState(prev => ({ ...prev, isExpanded: false }))
      playSound("click")
    }
  }

  const handleNexusClick = () => {
    setNexusState(prev => ({ ...prev, isExpanded: true }))
    setTimeout(() => inputRef.current?.focus(), 100)
    playSound("click")
  }

  const handleModuleClick = (module: NexusModule) => {
    console.log("Module clicked:", module.label)
    setNexusState(prev => ({ ...prev, activeModule: module }))
    playSound("click")
  }

  const handlePinToggle = () => {
    const newPinned = !nexusState.isPinned
    setNexusState(prev => ({ 
      ...prev, 
      isPinned: newPinned,
      isDocked: newPinned ? prev.isDocked : false 
    }))
    playSound(newPinned ? "dock" : "undock")
  }

  const handleExpandToggle = () => {
    const sizes: ("small" | "medium" | "large")[] = ["small", "medium", "large"]
    const currentIndex = sizes.indexOf(nexusState.expandSize)
    const nextIndex = (currentIndex + 1) % sizes.length
    
    setNexusState(prev => ({ ...prev, expandSize: sizes[nextIndex] }))
    playSound("click")
  }

  const handleDragStart = (type: "nexus" | "icon", data?: any) => {
    setDragState({
      isDragging: true,
      draggedItem: { id: `${type}-${Date.now()}`, type, data },
      showPreviewGrid: true,
      activeDropZone: null,
    })
    playSound("click")
  }

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      showPreviewGrid: false,
      activeDropZone: null,
    })
    playSound("snap")
  }

  const handleDropZoneEnter = (zoneId: string) => {
    setDragState(prev => ({ ...prev, activeDropZone: zoneId }))
  }

  const handleDropZoneLeave = () => {
    setDragState(prev => ({ ...prev, activeDropZone: null }))
  }

  // Calculate center position for orbital icons (relative to screen center)
  const centerPosition = {
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 800,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
      {/* Semi-opaque overlay when expanded */}
      {nexusState.isExpanded && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 pointer-events-auto" 
          onClick={() => setNexusState(prev => ({ ...prev, isExpanded: false }))} 
        />
      )}

      {/* Orbital Icons System */}
      <OrbitalIcons
        modules={availableModules}
        isExpanded={nexusState.isExpanded}
        centerPosition={centerPosition}
        radius={150}
        onModuleClick={handleModuleClick}
        isDragging={dragState.isDragging}
      />

      {/* Drag Preview System */}
      <DragPreview
        dragState={dragState}
        onDropZoneEnter={handleDropZoneEnter}
        onDropZoneLeave={handleDropZoneLeave}
      />

      {/* Main Nexus Container */}
      <div 
        ref={nexusRef}
        className="fixed top-1/2 left-1/2 pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className={`
            relative backdrop-blur-md bg-slate-900/90 
            border-2 rounded-2xl shadow-2xl transition-all duration-500 cursor-pointer
            ${
              nexusState.isExpanded
                ? "border-cyan-500/50 shadow-cyan-500/30 z-50"
                : "border-slate-700/50 hover:border-cyan-500/30"
            }
            ${dragState.isDragging ? "scale-105 rotate-1" : ""}
          `}
          style={{
            width: nexusState.size.width,
            height: nexusState.size.height,
          }}
          onClick={!nexusState.isExpanded ? handleNexusClick : undefined}
          onMouseDown={!nexusState.isPinned ? (e) => {
            e.preventDefault()
            handleDragStart("nexus")
          } : undefined}
        >
          {/* Energy Ring */}
          <div
            className={`
              absolute -inset-1 rounded-2xl opacity-50
              bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20
              ${nexusState.isExpanded ? "animate-spin-slow" : ""}
            `}
          />

          <div className="relative p-6 h-full flex flex-col">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {nexusState.activeModule?.header || "COMMAND NEXUS"}
              </div>
              {!nexusState.isExpanded && (
                <div>
                  <div className="text-sm text-slate-400 mb-2">
                    {nexusState.activeModule?.description || "Central Command Interface • Click to expand"}
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="text-xs text-cyan-400">
                      {nexusState.activeModule ? `${nexusState.activeModule.label} Active` : "Neural Link Active"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Control Buttons (visible in top right when expanded) */}
            {nexusState.isExpanded && (
              <div className="absolute top-2 right-2 flex items-center space-x-1 z-10">
                <button
                  onClick={handlePinToggle}
                  className={`
                    p-1.5 rounded-lg transition-all duration-200 flex items-center text-xs
                    ${nexusState.isPinned 
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                      : "bg-slate-700/50 text-slate-400 hover:text-cyan-400 hover:bg-slate-600/50 border border-slate-600/30"
                    }
                  `}
                  title={nexusState.isPinned ? "Unpin (Make draggable)" : "Pin (Dock in place)"}
                >
                  <Pin size={12} className={nexusState.isPinned ? "rotate-45" : ""} />
                </button>

                <button
                  onClick={handleExpandToggle}
                  className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:text-cyan-400 hover:bg-slate-600/50 transition-all duration-200 border border-slate-600/30"
                  title={`Size: ${nexusState.expandSize} (click to cycle)`}
                >
                  {nexusState.expandSize === "small" ? <Minimize2 size={12} /> : 
                   nexusState.expandSize === "medium" ? <Maximize2 size={12} /> : 
                   <Move size={12} />}
                </button>
              </div>
            )}

            {/* Expanded Interface */}
            {nexusState.isExpanded && (
              <div className="flex-1 space-y-4 mt-4">
                {/* Command Input */}
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={prompt}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder={
                      nexusState.activeModule 
                        ? `Enter ${nexusState.activeModule.label} command...`
                        : "Enter AI command... (Ctrl+Space)"
                    }
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

                    <button
                      onClick={onDock}
                      className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-cyan-400 hover:bg-slate-600/50 transition-all duration-200 flex items-center space-x-2"
                    >
                      <Pin size={16} />
                      <span className="text-sm">Dock</span>
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

                {/* Active Module Info */}
                {nexusState.activeModule && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                    <div className={`w-10 h-10 rounded-lg bg-${nexusState.activeModule.color}-500/20 flex items-center justify-center`}>
                      <nexusState.activeModule.icon size={20} className={`text-${nexusState.activeModule.color}-400`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{nexusState.activeModule.label}</div>
                      <div className="text-xs text-slate-400">{nexusState.activeModule.description}</div>
                    </div>
                    <button
                      onClick={() => setNexusState(prev => ({ ...prev, activeModule: null }))}
                      className="ml-auto p-1 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}

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
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
      `}</style>
    </div>
  )
}

export { EnhancedNexus }
export type { EnhancedNexusProps }
