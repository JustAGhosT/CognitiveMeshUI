"use client"
import { useState, useRef, useEffect } from "react"
import { Mic, Send, Zap, Brain, Shield, Activity } from "lucide-react"

interface CommandNexusProps {
  onPromptSubmit?: (prompt: string) => void
  isVoiceActive?: boolean
  onVoiceToggle?: () => void
}

export default function CommandNexus({ onPromptSubmit, isVoiceActive = false, onVoiceToggle }: CommandNexusProps) {
  const [prompt, setPrompt] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const contextPanels = [
    { icon: Brain, label: "Reasoning", status: "active", color: "cyan" },
    { icon: Shield, label: "Security", status: "monitoring", color: "green" },
    { icon: Activity, label: "Analytics", status: "processing", color: "purple" },
    { icon: Zap, label: "Agents", status: "ready", color: "blue" },
  ]

  const promptSuggestions = [
    "Analyze system performance trends",
    "Deploy new security agent",
    "Generate compliance report",
    "Optimize resource allocation",
    "Monitor threat intelligence",
    "Execute diagnostic scan",
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault()
        setIsActive(true)
        inputRef.current?.focus()
      }
      if (e.key === "Escape") {
        setIsActive(false)
        setPrompt("")
        setSuggestions([])
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handlePromptChange = (value: string) => {
    setPrompt(value)
    if (value.length > 2) {
      const filtered = promptSuggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()))
      setSuggestions(filtered.slice(0, 4))
    } else {
      setSuggestions([])
    }
  }

  const handleSubmit = () => {
    if (prompt.trim()) {
      onPromptSubmit?.(prompt)
      setPrompt("")
      setSuggestions([])
      setIsActive(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
      {/* Backdrop when active */}
      {isActive && (
        <div
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm pointer-events-auto"
          onClick={() => setIsActive(false)}
        />
      )}

      {/* Central Command Interface */}
      <div
        className={`
        relative transition-all duration-500 pointer-events-auto
        ${isActive ? "scale-110" : "scale-100"}
      `}
      >
        {/* Orbital Context Panels */}
        <div className="absolute inset-0 w-96 h-96">
          {contextPanels.map((panel, index) => {
            const Icon = panel.icon
            const angle = index * 90 - 45 // Position at corners
            const radius = 180
            const x = Math.cos((angle * Math.PI) / 180) * radius
            const y = Math.sin((angle * Math.PI) / 180) * radius

            return (
              <div
                key={panel.label}
                className={`
                  absolute w-16 h-16 backdrop-blur-md bg-slate-900/80 
                  border border-slate-700/50 rounded-xl
                  flex items-center justify-center cursor-pointer
                  transition-all duration-300 hover:scale-110
                  hover:border-${panel.color}-500/50 hover:shadow-${panel.color}-500/20
                  ${isActive ? "opacity-100" : "opacity-60"}
                `}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  animation: isActive ? `orbit-${index} 20s linear infinite` : "none",
                }}
              >
                <Icon size={24} className={`text-${panel.color}-400`} />
                <div
                  className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                  text-xs text-${panel.color}-400 whitespace-nowrap`}
                >
                  {panel.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Central Command Input */}
        <div
          className={`
          relative w-96 backdrop-blur-md bg-slate-900/90 
          border-2 rounded-2xl shadow-2xl transition-all duration-300
          ${isActive ? "border-cyan-500/50 shadow-cyan-500/30" : "border-slate-700/50 hover:border-cyan-500/30"}
        `}
        >
          {/* Energy Ring */}
          <div
            className={`
            absolute -inset-1 rounded-2xl opacity-50
            bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20
            ${isActive ? "animate-spin-slow" : ""}
          `}
          />

          <div className="relative p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={prompt}
                  onChange={(e) => handlePromptChange(e.target.value)}
                  onFocus={() => setIsActive(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Enter AI command... (Ctrl+Space)"
                  className="w-full bg-transparent text-white placeholder-slate-400 
                    text-lg outline-none"
                />

                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <div
                    className="absolute top-full left-0 right-0 mt-2 
                    backdrop-blur-md bg-slate-900/90 border border-slate-700/50 
                    rounded-lg shadow-xl z-50"
                  >
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setPrompt(suggestion)
                          setSuggestions([])
                        }}
                        className="p-3 hover:bg-slate-700/50 cursor-pointer 
                          text-slate-300 hover:text-white transition-colors
                          border-b border-slate-700/30 last:border-b-0"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onVoiceToggle}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isVoiceActive
                      ? "bg-red-500/20 text-red-400 animate-pulse"
                      : "bg-slate-700/50 text-slate-400 hover:text-cyan-400"
                  }`}
                >
                  <Mic size={20} />
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim()}
                  className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 
                    hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
              <span>Cognitive Mesh Command Interface</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Neural Network Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { CommandNexus }
export type { CommandNexusProps }
