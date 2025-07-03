"use client"
import { useState, useRef, useEffect } from "react"
import { Mic, Send, Users, Brain, BarChart3, Shield, Pin } from "lucide-react"

interface EnhancedNexusProps {
  onPromptSubmit?: (prompt: string) => void
  isVoiceActive?: boolean
  onVoiceToggle?: () => void
  onDock?: () => void
}

export default function EnhancedNexus({
  onPromptSubmit,
  isVoiceActive = false,
  onVoiceToggle,
  onDock,
}: EnhancedNexusProps) {
  const [prompt, setPrompt] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const contextPanels = [
    { icon: Users, label: "Agent Control", color: "cyan" },
    { icon: Brain, label: "Reasoning Engine", color: "blue" },
    { icon: BarChart3, label: "Analytics Hub", color: "purple" },
    { icon: Shield, label: "Security Matrix", color: "green" },
  ]

  const promptSuggestions = ["Deploy Agent", "Security Scan", "Performance Report", "System Status"]

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
    setIsExpanded(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  return (
    <>
      {/* Semi-opaque overlay when expanded */}
      {isExpanded && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40" onClick={() => setIsExpanded(false)} />
      )}

      {/* Nexus Container */}
      <div className="relative">
        {/* Side Icons (when not expanded) */}
        {!isExpanded && (
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

        {/* Main Nexus Container */}
        <div
          className={`
            relative backdrop-blur-md bg-slate-900/90 
            border-2 rounded-2xl shadow-2xl transition-all duration-500 cursor-pointer
            ${
              isExpanded
                ? "w-[500px] h-[320px] border-cyan-500/50 shadow-cyan-500/30 z-50"
                : "w-[400px] h-[120px] border-slate-700/50 hover:border-cyan-500/30"
            }
          `}
          onClick={!isExpanded ? handleNexusClick : undefined}
        >
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
                  <div className="text-sm text-slate-400 mb-2">Central Command Interface • Click to expand</div>
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
    </>
  )
}

export { EnhancedNexus }
export type { EnhancedNexusProps }
