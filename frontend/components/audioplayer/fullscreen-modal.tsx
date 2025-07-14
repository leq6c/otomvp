"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FullscreenModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function FullscreenModal({ isOpen, onClose, children }: FullscreenModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-8 h-8" />
            <span className="sr-only">Close player</span>
          </Button>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
