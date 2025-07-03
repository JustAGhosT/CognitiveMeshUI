"use client"
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  DragEvent,
} from "react"
import {
  Mic,
  Send,
  Users,
  Brain,
  BarChart3,
  Shield,
  Pin,
  Maximize2,
  Minimize2,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react"
import OrbitalIcons from "./OrbitalIcons"
import DragPreview from "./DragPreview"
import { useAudioSystem } from "../../hooks/useAudioSystem"
import type {
  NexusState,
  NexusModule,
  IconPosition,
  NexusConfig,
} from "../../types/nexus"

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
  // ——— 1) CONFIG & AUDIO ———
  const defaultConfig: NexusConfig = {
    transitionDuration: 500,
    orbitRadius: 150,
    orbitAnimationDuration: 500,
    sizes: {
      small: { width: 300, height: 100 },
      medium: { width: 400, height: 120 },
      large: { width: 500, height: 150 },
    },
    audio: {
      enabled: true,
      volume: soundVolume,
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
  const config = defaultConfig
  const audioSystem = useAudioSystem(config.audio)

  // ——— 2) STATE ———
  const [nexusState, setNexusState] = useState<NexusState>({
    isExpanded: false,
    expandSize: "medium",
    orbitMode: config.defaultOrbitMode,
    isPinned: config.defaultPinned,
    isDocked: false,
    activeModule: null,
    iconPositions: [],
  })
  const [prompt, setPrompt] = useState("")
  const [suggestions] = useState([
    "Deploy Agent",
    "Security Scan",
    "Performance Report",
    "System Status",
  ])
  const inputRef = useRef<HTMLInputElement>(null)
  const nexusRef = useRef<HTMLDivElement>(null)

  // ——— 3) MODULES ———
  const modules: NexusModule[] = [
    {
      id: "agent-control",
      label: "Agent Control",
      icon: Users,
      color: "cyan",
      header: "Agent Control Center",
      description: "Manage AI agents and their tasks",
    },
    {
      id: "reasoning-engine",
      label: "Reasoning Engine",
      icon: Brain,
      color: "blue",
      header: "Reasoning Engine",
      description: "Advanced cognitive processing",
    },
    {
      id: "analytics-hub",
      label: "Analytics Hub",
      icon: BarChart3,
      color: "purple",
      header: "Analytics Hub",
      description: "Data insights and metrics",
    },
    {
      id: "security-matrix",
      label: "Security Matrix",
      icon: Shield,
      color: "green",
      header: "Security Matrix",
      description: "Security monitoring and control",
    },
  ]

  // ——— 4) STATE UPDATERS ———
  const updateState = useCallback(
    (updates: Partial<NexusState>) => {
      setNexusState((prev) => ({ ...prev, ...updates }))
    },
    []
  )

  // ——— 5) HANDLERS ———
  // expand/collapse via Ctrl+Space or Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault()
        updateState({ isExpanded: true })
        setTimeout(() => inputRef.current?.focus(), 100)
      }
      if (e.key === "Escape") {
        updateState({ isExpanded: false, activeModule: null })
        setPrompt("")
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [updateState])

  // module click: expand + orbit + sound
  const handleModuleClick = useCallback(
    (id: string) => {
      const isActive = nexusState.activeModule === id
      if (isActive) {
        updateState({ activeModule: null, isExpanded: false, orbitMode: false })
        audioSystem.playSound("collapse")
      } else {
        updateState({ activeModule: id, isExpanded: true, orbitMode: true })
        audioSystem.playSound("expand")
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    },
    [nexusState.activeModule, updateState, audioSystem]
  )

  // toggle orbit/pin/size
  const toggleOrbit = useCallback(() => {
    updateState({ orbitMode: !nexusState.orbitMode })
    audioSystem.playSound("click")
  }, [nexusState.orbitMode, updateState, audioSystem])

  const togglePin = useCallback(() => {
    const next = !nexusState.isPinned
    updateState({ isPinned: next })
    audioSystem.playSound(next ? "dock" : "undock")
    if (next) onDock?.()
  }, [nexusState.isPinned, updateState, audioSystem, onDock])

  const cycleSize = useCallback(() => {
    const sizes = ["small", "medium", "large"] as const
    const idx = sizes.indexOf(nexusState.expandSize)
    const next = sizes[(idx + 1) % sizes.length]
    updateState({ expandSize: next })
    audioSystem.playSound("click")
  }, [nexusState.expandSize, updateState, audioSystem])

  // prompt submit
  const handleSubmit = () => {
    if (!prompt.trim()) return
    onPromptSubmit?.(prompt)
    setPrompt("")
    updateState({ isExpanded: false })
    audioSystem.playSound("click")
  }

  // drop target outside
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const data = e.dataTransfer.getData("application/json")
    const { moduleId } = JSON.parse(data)
    console.log("Dropped out:", moduleId)
    // remove from orbit
    updateState({ activeModule: null })
    audioSystem.playSound("dock")
  }

  // ——— 6) ORBITAL ICONS CALLBACK ———
  const handleIconPositionsChange = useCallback(
    (pos: IconPosition[]) => updateState({ iconPositions: pos }),
    [updateState]
  )

  // ——— 7) RENDER ———
  const activeModuleData = modules.find((m) => m.id === nexusState.activeModule)
  const centerPosition = {
    x:
      nexusRef.current?.getBoundingClientRect().left ??
      window.innerWidth / 2,
    y:
      nexusRef.current?.getBoundingClientRect().top ??
      window.innerHeight / 2,
  }

  return (
    <div className="fixed inset-0 pointer-events-none">
      {nexusState.isExpanded && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 pointer-events-auto"
          onClick={() => updateState({ isExpanded: false })}
        />
      )}

      {/* drop zone to remove icons */}
      <div
        className="absolute bottom-4 left-4 w-40 h-24 border-2 border-dashed border-rose-400 text-center text-rose-400"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        Drop here to undock
      </div>

      {/* Drag preview */}
      <DragPreview config={config.dragPreview} />

      {/* Orbital icons */}
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
        centerPosition={centerPosition}
        className="z-50"
      />

      {/* Main nexus panel */}
      <div
        ref={nexusRef}
        className={`fixed top-1/2 left-1/2 pointer-events-auto transform -translate-x-1/2 -translate-y-1/2
          bg-slate-900/90 backdrop-blur-md border-2 rounded-2xl shadow-2xl
          transition-all duration-${config.transitionDuration}
          ${nexusState.isExpanded ? "border-cyan-500/50 z-50" : "border-slate-700/50"}
          ${nexusState.isPinned ? "cursor-pointer" : "cursor-grab"}
        `}
        style={{
          width:
            config.sizes[nexusState.expandSize].width *
            (nexusState.isExpanded ? 1.25 : 1),
          height:
            config.sizes[nexusState.expandSize].height *
            (nexusState.isExpanded ? 2.4 : 1),
        }}
        onClick={
          !nexusState.isExpanded
            ? () => updateState({ isExpanded: true })
            : undefined
        }
      >
        {/* Energy ring */}
        <div
          className={`
            absolute -inset-1 rounded-2xl opacity-50
            bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20
            ${nexusState.isExpanded ? "animate-spin-slow" : ""}
            ${activeModuleData ? "animate-pulse" : ""}
          `}
        />

        <div className="relative p-6 h-full flex flex-col">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {activeModuleData?.header || "COMMAND NEXUS"}
            </h2>
            {!nexusState.isExpanded && (
              <p className="text-sm text-slate-400 mt-1">
                {activeModuleData
                  ? `${activeModuleData.label} Active`
                  : "Click to expand"}
              </p>
            )}
          </div>

          {/* Controls */}
          {nexusState.isExpanded && (
            <div className="absolute top-2 right-2 flex space-x-1 z-10">
              <button
                onClick={togglePin}
                title={nexusState.isPinned ? "Unpin" : "Pin"}
                className={`p-1.5 rounded-lg transition ${
                  nexusState.isPinned
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-slate-700/50 text-slate-400 hover:text-cyan-400"
                }`}
              >
                <Pin size={12} className={nexusState.isPinned ? "rotate-45" : ""} />
              </button>
              <button
                onClick={cycleSize}
                className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition"
                title="Cycle Size"
              >
                {nexusState.expandSize === "small" && <Minimize2 size={12} />}
                {nexusState.expandSize === "medium" && <Maximize2 size={12} />}
                {nexusState.expandSize === "large" && <RotateCcw size={12} />}
              </button>
            </div>
          )}

          {/* Expanded UI */}
          {nexusState.isExpanded && (
            <div className="flex-1 flex flex-col space-y-4 mt-4">
              {/* Active module info */}
              {activeModuleData && (
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center mb-2 space-x-2">
                    <activeModuleData.icon
                      size={16}
                      className={`text-${activeModuleData.color}-400`}
                    />
                    <span className={`font-medium text-${activeModuleData.color}-400`}>
                      {activeModuleData.label}
                    </span>
                  </div>
                  <p>{activeModuleData.description}</p>
                </div>
              )}

              {/* Input */}
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder={
                    activeModuleData
                      ? `Enter ${activeModuleData.label} command…`
                      : "Enter AI command… (Ctrl+Space)"
                  }
                  className="w-full bg-slate-800/50 text-white text-lg p-4 rounded-xl border border-slate-700/50 focus:border-cyan-500/50 transition"
                />
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={onVoiceToggle}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                      isVoiceActive
                        ? "bg-red-500/20 text-red-400 animate-pulse"
                        : "bg-slate-700/50 text-slate-400 hover:text-cyan-400"
                    }`}
                  >
                    <Mic size={16} />
                    <span>Hey Mesh</span>
                  </button>
                  <button
                    onClick={toggleOrbit}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                      nexusState.orbitMode
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-slate-700/50 text-slate-400 hover:text-purple-400"
                    }`}
                  >
                    <RotateCcw size={16} />
                    <span>Orbit</span>
                  </button>
                  <button
                    onClick={() => audioSystem.toggleEnabled()}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                      audioSystem.isEnabled
                        ? "bg-green-500/20 text-green-400"
                        : "bg-slate-700/50 text-slate-400 hover:text-green-400"
                    }`}
                  >
                    {audioSystem.isEnabled ? (
                      <Volume2 size={16} />
                    ) : (
                      <VolumeX size={16} />
                    )}
                    <span>Audio</span>
                  </button>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim()}
                  className="px-6 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Send size={16} />
                  Execute
                </button>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setPrompt(s)}
                    className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full hover:bg-cyan-500/20"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer status */}
          {nexusState.isExpanded && (
            <div className="text-xs text-slate-400 pt-2 border-t border-slate-700/50 flex justify-between">
              <span>Command Nexus Interface</span>
              <span>
                {nexusState.orbitMode && "• Orbit Mode Active"}{" "}
                {activeModuleData && `• ${activeModuleData.label}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Slow spin animation */}
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

export type { EnhancedNexusProps }
