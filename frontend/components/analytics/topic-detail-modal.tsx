"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { Topic } from "@/types"
import { Button } from "@/components/ui/button"

type TopicDetailModalProps = {
  isOpen: boolean
  onClose: () => void
  topic: Topic | null
}

const TrendIconDisplay = ({ trend, size = 24 }: { trend: Topic["trend"]; size?: number }) => {
  const iconProps = { size, strokeWidth: 2.5 }
  switch (trend) {
    case "up":
      return <TrendingUp className="text-green-500" {...iconProps} aria-label="Trending up" />
    case "down":
      return <TrendingDown className="text-red-500" {...iconProps} aria-label="Trending down" />
    default:
      return <Minus className="text-neutral-400" {...iconProps} aria-label="Trend stable" />
  }
}

export default function TopicDetailModal({ isOpen, onClose, topic }: TopicDetailModalProps) {
  if (!isOpen || !topic) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-lg"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="topic-detail-modal-title"
    >
      <div
        className="bg-white/80 backdrop-blur-2xl p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md text-neutral-800 border border-white/30 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "85vh" }}
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-grow">
            <h2 id="topic-detail-modal-title" className="text-2xl font-bold text-neutral-900 leading-tight">
              {topic.name}
            </h2>
          </div>
          <TrendIconDisplay trend={topic.trend} size={32} />
        </div>

        <div className="text-sm text-neutral-700 leading-relaxed max-h-[30vh] overflow-y-auto pr-1">
          <p>{topic.shortDescription}</p>
        </div>

        <div>
          <h3 className="text-xs uppercase font-semibold text-neutral-500 mb-1.5 tracking-wider">Discussion Volume</h3>
          <div className="w-full bg-neutral-200/70 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-sky-500 h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end"
              style={{ width: `${topic.volume}%` }}
              aria-valuenow={topic.volume}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            >
              <span className="text-white text-[10px] font-medium pr-1.5">{topic.volume}%</span>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-300/70 pt-4">
          <h3 className="text-xs uppercase font-semibold text-neutral-500 mb-2 tracking-wider">Related Insights</h3>
          <p className="text-sm text-neutral-600 italic">
            Detailed sentiment analysis, key drivers, or related micro-trends could be displayed here.
          </p>
        </div>

        <div className="mt-2 flex justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-500/10 px-4 py-2"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
