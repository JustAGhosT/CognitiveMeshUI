"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { Mic, Send, Users, Brain, BarChart3, Shield, Pin, Maximize2, RotateCcw, Volume2, VolumeX } from "lucide-react"
import OrbitalIcons from "./OrbitalIcons"
import DragPreview from "./DragPreview"
import { useAudioSystem } from "../../hooks/useAudioSystem"
import type { NexusState, NexusModule, IconPosition, NexusConfig } from "../../types/nexus"

interface EnhancedNexusProps {
  onPromptSubmit?: (prompt: string) => void
  isVoiceActive?: boolean
  onVoiceToggle?: () => void
  onDock?: () => void
  initialConfig?: Partial<NexusConfig>
}

export default function EnhancedNexus({
  onPromptSubmit,
  isVoiceActive = false,
  onVoiceToggle,
  onDock,
  initialConfig = {},
}: EnhancedNexusProps) {
  // Default configuration
  const defaultConfig: NexusConfig = {
    transitionDuration: 500,
    orbitRadius: 150,
    orbitSpeed: 1,
    sizes: {
      small: { width: 300, height: 100 },
      medium: { width: 400, height: 120 },
      large: { width: 500, height: 150 },
    },
    iconCount: 4,
    orbitAnimationDuration: 500,
    audio: {
      enabled: true,
      volume: 0.5,
      sounds: {
        dock: "/sounds/dock.mp3",
        undock: "/sounds/undock.mp3",
        click: "/sounds/click.mp3",
        expand: "/sounds/expand.mp3",
        collapse: "/sounds/collapse.mp3",
      },
    },
    dragPreview: {
      gridSize: 50,
      highlightColor: "cyan-500",
      snapThreshold: 20,
      showGrid: true,
      animationDuration: 300,
    },
    defaultOrbitMode: false,
    defaultPinned: true,
    defaultSizeMode: "medium",
  }

  const config = { ...defaultConfig, ...initialConfig }

  // Enhanced state management
  const [nexusState, setNexusState] = useState<NexusState>({
    isExpanded: false,
    expansionLevel: "collapsed",
    activeModule: null,
    orbitMode: config.defaultOrbitMode,
    iconPositions: [],
    isOrbiting: false,
    isPinned: config.defaultPinned,
    isDocked: false,
    sizeMode: config.defaultSizeMode,
    isDragging: false,
    dragPreviewVisible: false,
    dropZoneHighlighted: null,
  })

  // Legacy state for backward compatibility
  const [prompt, setPrompt] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Audio system
  const audioSystem = useAudioSystem(config.audio)

  // Modules configuration
  const modules: NexusModule[] = [
    { 
      id: "agents", 
      label: "Agent Control", 
      icon: Users, 
      color: "cyan",
      header: "Agent Control Center",
      content: <div>Agent management interface</div>,
      isActive: nexusState.activeModule === "agents"
    },
    { 
      id: "reasoning", 
      label: "Reasoning Engine", 
      icon: Brain, 
      color: "blue",
      header: "Reasoning Engine",
      content: <div>AI reasoning interface</div>,
      isActive: nexusState.activeModule === "reasoning"
    },
    { 
      id: "analytics", 
      label: "Analytics Hub", 
      icon: BarChart3, 
      color: "purple",
      header: "Analytics Dashboard",
      content: <div>Analytics and metrics</div>,
      isActive: nexusState.activeModule === "analytics"
    },
    { 
      id: "security", 
      label: "Security Matrix", 
      icon: Shield, 
      color: "green",
      header: "Security Center",
      content: <div>Security monitoring</div>,
      isActive: nexusState.activeModule === "security"
    },
  ]

  const promptSuggestions = ["Deploy Agent", "Security Scan", "Performance Report", "System Status"]

  // Calculate current size based on state
  const getCurrentSize = () => {
    const baseSize = config.sizes[nexusState.sizeMode]
    if (nexusState.isExpanded) {
      return {
        width: baseSize.width * 1.25,
        height: baseSize.height * 2.4, // +40% expansion as specified
      }
    }
    return baseSize
  }

  // State update helpers
  const updateNexusState = useCallback((updates: Partial<NexusState>) => {
    setNexusState(prev => ({ ...prev, ...updates }))
  }, [])

  // Handle module click
  const handleModuleClick = useCallback((moduleId: string) => {
    const isCurrentlyActive = nexusState.activeModule === moduleId
    
    if (isCurrentlyActive) {
      // Deactivate module
      updateNexusState({ 
        activeModule: null,
        orbitMode: false,
        isExpanded: false 
      })
      audioSystem.playSound("collapse")
    } else {
      // Activate module
      updateNexusState({ 
        activeModule: moduleId,
        orbitMode: true,
        isExpanded: true 
      })
      audioSystem.playSound("expand")
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [nexusState.activeModule, updateNexusState, audioSystem])

  // Handle orbit mode toggle
  const handleOrbitModeToggle = useCallback(() => {
    const newOrbitMode = !nexusState.orbitMode
    updateNexusState({ orbitMode: newOrbitMode })
    audioSystem.playSound("click")
  }, [nexusState.orbitMode, updateNexusState, audioSystem])

  // Handle pin toggle
  const handlePinToggle = useCallback(() => {
    const newPinned = !nexusState.isPinned
    updateNexusState({ isPinned: newPinned })
    audioSystem.playSound(newPinned ? "dock" : "undock")
    
    if (newPinned) {
      // Re-dock at current position
      onDock?.()
    }
  }, [nexusState.isPinned, updateNexusState, audioSystem, onDock])

  // Handle size cycling
  const handleSizeCycle = useCallback(() => {
    const sizes: ("small" | "medium" | "large")[] = ["small", "medium", "large"]
    const currentIndex = sizes.indexOf(nexusState.sizeMode)
    const nextIndex = (currentIndex + 1) % sizes.length
    
    updateNexusState({ sizeMode: sizes[nextIndex] })
    audioSystem.playSound("click")
  }, [nexusState.sizeMode, updateNexusState, audioSystem])

  // Handle icon positions change
  const handleIconPositionsChange = useCallback((positions: IconPosition[]) => {
    updateNexusState({ iconPositions: positions })
  }, [updateNexusState])

  // Handle drag operations
  const handleDragStart = useCallback((type: "nexus" | "icon", id?: string) => {
    updateNexusState({ 
      isDragging: true, 
      dragPreviewVisible: true 
    })
    audioSystem.playSound("click")
  }, [updateNexusState, audioSystem])

  const handleDragEnd = useCallback(() => {
    updateNexusState({ 
      isDragging: false, 
      dragPreviewVisible: false,
      dropZoneHighlighted: null 
    })
  }, [updateNexusState])

  const handleDrop = useCallback((zoneId: string, position: { x: number; y: number }) => {
    console.log("Dropped at zone:", zoneId, "position:", position)
    updateNexusState({ 
      isDragging: false, 
      dragPreviewVisible: false,
      dropZoneHighlighted: null 
    })
    audioSystem.playSound("dock")
  }, [updateNexusState, audioSystem])

  // Legacy keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault()
        updateNexusState({ isExpanded: true })
        inputRef.current?.focus()
      }
      if (e.key === "Escape") {
        updateNexusState({ isExpanded: false, activeModule: null })
        setPrompt("")
        setSuggestions([])
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [updateNexusState])

  // Legacy handlers
  const handlePromptChange = (value: string) => {
    setPrompt(value)
  }

  const handleSubmit = () => {
    if (prompt.trim()) {
      onPromptSubmit?.(prompt)
      setPrompt("")
      setSuggestions([])
      updateNexusState({ isExpanded: false })
    }
  }

  const handleNexusClick = () => {
    updateNexusState({ isExpanded: true })
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // Get current size
  const currentSize = getCurrentSize()
  const activeModuleData = modules.find(m => m.id === nexusState.activeModule)

  return (
    <>
      {/* Semi-opaque overlay when expanded */}
      {nexusState.isExpanded && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40" onClick={() => updateNexusState({ isExpanded: false })} />
      )}

      {/* Drag Preview System */}
      <DragPreview
        isVisible={nexusState.dragPreviewVisible}
        draggedItem={nexusState.isDragging ? { type: "nexus", id: "main" } : null}
        onDrop={handleDrop}
        config={config.dragPreview}
      />

      {/* Nexus Container */}
      <div className="relative">
        {/* Orbital Icons System */}
        <OrbitalIcons
          modules={modules}
          isExpanded={nexusState.isExpanded}
          orbitMode={nexusState.orbitMode}
          iconPositions={nexusState.iconPositions}
          onIconPositionsChange={handleIconPositionsChange}
          onModuleClick={handleModuleClick}
          activeModule={nexusState.activeModule}
          orbitRadius={config.orbitRadius}
          animationDuration={config.orbitAnimationDuration}
        />

        {/* Main Nexus Container */}
        <div
          className={`
            relative backdrop-blur-md bg-slate-900/90 
            border-2 rounded-2xl shadow-2xl transition-all duration-500
            ${nexusState.isDragging ? "cursor-grabbing" : nexusState.isPinned ? "cursor-pointer" : "cursor-grab"}
            ${
              nexusState.isExpanded
                ? "border-cyan-500/50 shadow-cyan-500/30 z-50"
                : "border-slate-700/50 hover:border-cyan-500/30"
            }
            ${nexusState.activeModule ? "ring-2 ring-cyan-500/30" : ""}
          `}
          style={{
            width: `${currentSize.width}px`,
            height: `${currentSize.height}px`,
          }}
          onClick={!nexusState.isExpanded ? handleNexusClick : undefined}
          onMouseDown={(e) => {
            if (!nexusState.isPinned) {
              handleDragStart("nexus")
            }
          }}
        >
          {/* Energy Ring */}
          <div
            className={`
            absolute -inset-1 rounded-2xl opacity-50
            bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20
            ${nexusState.isExpanded ? "animate-spin-slow" : ""}
            ${nexusState.activeModule ? "animate-pulse" : ""}
          `}
          />

          <div className="relative p-6 h-full flex flex-col">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {activeModuleData ? activeModuleData.header : "COMMAND NEXUS"}
              </div>
              {!nexusState.isExpanded && (
                <div>
                  <div className="text-sm text-slate-400 mb-2">
                    {activeModuleData ? `${activeModuleData.label} Active` : "Central Command Interface • Click to expand"}
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${activeModuleData ? `bg-${activeModuleData.color}-400` : "bg-cyan-400"}`} />
                    <span className={`text-xs ${activeModuleData ? `text-${activeModuleData.color}-400` : "text-cyan-400"}`}>
                      {activeModuleData ? "Module Active" : "Neural Link Active"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Expanded Interface */}
            {nexusState.isExpanded && (
              <div className="flex-1 space-y-4">
                {/* Active Module Content */}
                {activeModuleData && (
                  <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <activeModuleData.icon size={16} className={`text-${activeModuleData.color}-400`} />
                      <span className={`text-sm font-medium text-${activeModuleData.color}-400`}>
                        {activeModuleData.label}
                      </span>
                    </div>
                    {activeModuleData.content}
                  </div>
                )}

                {/* Command Input */}
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={prompt}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder={activeModuleData ? `${activeModuleData.label} command...` : "Enter AI command... (Ctrl+Space)"}
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
                      onClick={handlePinToggle}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                        nexusState.isPinned
                          ? "bg-cyan-500/20 text-cyan-400"
                          : "bg-slate-700/50 text-slate-400 hover:text-cyan-400 hover:bg-slate-600/50"
                      }`}
                    >
                      <Pin size={16} />
                      <span className="text-sm">{nexusState.isPinned ? "Pinned" : "Pin"}</span>
                    </button>

                    <button
                      onClick={handleSizeCycle}
                      className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-cyan-400 hover:bg-slate-600/50 transition-all duration-200 flex items-center space-x-2"
                    >
                      <Maximize2 size={16} />
                      <span className="text-sm capitalize">{nexusState.sizeMode}</span>
                    </button>

                    <button
                      onClick={handleOrbitModeToggle}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                        nexusState.orbitMode
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-slate-700/50 text-slate-400 hover:text-purple-400 hover:bg-slate-600/50"
                      }`}
                    >
                      <RotateCcw size={16} />
                      <span className="text-sm">Orbit</span>
                    </button>

                    <button
                      onClick={audioSystem.toggleEnabled}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                        audioSystem.isEnabled
                          ? "bg-green-500/20 text-green-400"
                          : "bg-slate-700/50 text-slate-400 hover:text-green-400 hover:bg-slate-600/50"
                      }`}
                    >
                      {audioSystem.isEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      <span className="text-sm">Audio</span>
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
                  <div className="flex items-center space-x-4">
                    <span>Cognitive Mesh Command Interface</span>
                    {nexusState.orbitMode && (
                      <span className="text-purple-400">• Orbit Mode Active</span>
                    )}
                    {nexusState.activeModule && (
                      <span className={`text-${activeModuleData?.color}-400`}>• {activeModuleData?.label}</span>
                    )}
                  </div>
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
      <style jsx>{`
        .animate-spin-slow { 
          animation: spin 8s linear infinite; 
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export { EnhancedNexus }
export type { EnhancedNexusProps }
