"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import styles from "./CommandNexus.module.css"

interface CommandNexusProps {
  onCommand?: (command: string) => void
  isActive?: boolean
  className?: string
}

export const CommandNexus: React.FC<CommandNexusProps> = ({ onCommand, isActive = true, className = "" }) => {
  const [command, setCommand] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const commonCommands = [
    "analyze data patterns",
    "optimize neural networks",
    "deploy cognitive modules",
    "initialize quantum processing",
    "activate deep learning protocols",
    "synchronize mesh networks",
  ]

  useEffect(() => {
    if (command.length > 2) {
      const filtered = commonCommands.filter((cmd) => cmd.toLowerCase().includes(command.toLowerCase()))
      setSuggestions(filtered.slice(0, 3))
    } else {
      setSuggestions([])
    }
  }, [command])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim()) {
      onCommand?.(command.trim())
      setCommand("")
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setCommand(suggestion)
    setSuggestions([])
    inputRef.current?.focus()
  }

  const handleVoiceToggle = () => {
    setIsListening(!isListening)
    // Voice recognition would be implemented here
  }

  return (
    <div className={`${styles.commandNexus} ${isActive ? styles.active : ""} ${className}`}>
      <div className={styles.nexusCore}>
        <div className={styles.energyRing}></div>
        <form onSubmit={handleSubmit} className={styles.commandForm}>
          <div className={styles.inputContainer}>
            <input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter AI command..."
              className={styles.commandInput}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`${styles.voiceButton} ${isListening ? styles.listening : ""}`}
              aria-label="Voice input"
            >
              🎤
            </button>
            <button
              type="submit"
              className={styles.executeButton}
              disabled={!command.trim()}
              aria-label="Execute command"
            >
              ⚡
            </button>
          </div>
        </form>
      </div>

      {suggestions.length > 0 && (
        <div className={styles.suggestions}>
          {suggestions.map((suggestion, index) => (
            <button key={index} onClick={() => handleSuggestionClick(suggestion)} className={styles.suggestionItem}>
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className={styles.statusIndicators}>
        <div className={`${styles.indicator} ${isActive ? styles.online : ""}`}>
          <span className={styles.indicatorDot}></span>
          Neural Network
        </div>
        <div className={`${styles.indicator} ${isListening ? styles.active : ""}`}>
          <span className={styles.indicatorDot}></span>
          Voice Recognition
        </div>
      </div>
    </div>
  )
}

export default CommandNexus
