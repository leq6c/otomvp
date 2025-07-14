"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import type { CaptionState } from "@/hooks/useCaptions"

interface CaptionDisplayProps {
  captionState: CaptionState
  className?: string
  typingSpeed?: number // Allow customizable typing speed
  enableTypingEffect?: boolean // Allow disabling typing effect
}

export default function CaptionDisplay({ 
  captionState, 
  className = "",
  typingSpeed = 30, // Much faster default: 30ms per character
  enableTypingEffect = true
}: CaptionDisplayProps) {
  const { currentCaption, nextCaption } = captionState
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const previousCaptionRef = useRef<string>("")
  const animationFrameRef = useRef<number | null>(null)
  const lastRenderTimeRef = useRef<number>(0)

  // Typing animation effect
  useEffect(() => {
    // Clear any existing typing interval
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    animationFrameRef.current = null

    if (!currentCaption?.caption) {
      setDisplayedText("")
      setIsTyping(false)
      previousCaptionRef.current = ""
      return
    }
    
    const targetText = currentCaption.caption
    
    // If it's the same caption as before, don't restart typing
    if (targetText === previousCaptionRef.current) {
    }
    
    previousCaptionRef.current = targetText

    // If typing effect is disabled, show text immediately
    if (!enableTypingEffect) {
      setDisplayedText(targetText)
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    setDisplayedText("")

    let currentIndex = 0


   const fps = 60;

    // use requestAnimationFrame to type the text
    const animateText = (now: number) => {
      const delta = now - lastRenderTimeRef.current;
      if (1000 / fps < delta) {
        lastRenderTimeRef.current = now;
        if (currentIndex < targetText.length) {
          setDisplayedText(targetText.slice(0, currentIndex + 1))
          currentIndex++
        }
      }

      if (currentIndex < targetText.length) {
        animationFrameRef.current = requestAnimationFrame(animateText)
      } else {
        setIsTyping(false)
        cancelAnimationFrame(animationFrameRef.current!)
      }
    }

    const animationFrame = requestAnimationFrame(animateText)

    return () => cancelAnimationFrame(animationFrame)
  }, [currentCaption?.caption, typingSpeed, enableTypingEffect])

  return (
    <div className={`flex flex-col items-center justify-center px-8 ${className}`}>
      {/* Current Caption - Centered with Typing Effect */}
      <div className="flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCaption?.caption || "empty"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight max-w-3xl">
              {displayedText && <span className="text-gray-500 dark:text-gray-400">"</span>}
              {displayedText}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                  className="ml-1 text-cyan-500 dark:text-cyan-400"
                >
                  |
                </motion.span>
              )}
              {!isTyping && displayedText && <span className="text-gray-500 dark:text-gray-400">"</span>}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
