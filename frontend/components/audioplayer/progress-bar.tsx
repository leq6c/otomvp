"use client"

import { motion } from "framer-motion"
import type { CaptionState } from "@/hooks/useCaptions"

interface ProgressBarProps {
  captionState: CaptionState
  className?: string
}

export default function ProgressBar({ captionState, className = "" }: ProgressBarProps) {
  const { currentCaption, progress } = captionState

  if (!currentCaption) return null

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-10 ${className}`}>
      <div className="w-full h-1 bg-gray-200/50 dark:bg-gray-700/50">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 dark:from-cyan-400 dark:via-purple-500 dark:to-pink-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  )
}
