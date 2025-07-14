"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { AnalysisData } from "@/types"
import TranscriptDetailModal from "./transcript-detail-modal"
import AiSummary from "./ai-summary"
import PerformanceInsights from "./performance-insights"
import ConversationBreakdown from "./conversation-breakdown"
import TranscriptList from "./transcript-list"
import ClipsSection from "./clips-section"

type AnalysisReportProps = {
  data: AnalysisData
  conversationId: string
  onContribute: () => void
}

export default function AnalysisReport({ data, conversationId, onContribute }: AnalysisReportProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [initialModalItemId, setInitialModalItemId] = useState<string | undefined>(undefined)

  const handleTranscriptItemClick = (itemId: string) => {
    setInitialModalItemId(itemId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setInitialModalItemId(undefined)
  }

  return (
    <>
      <div className="w-full max-w-3xl mx-auto">
        <ClipsSection conversationId={conversationId} />
        <AiSummary summary={data.aiSummary} />
        <PerformanceInsights data={data} />
        <ConversationBreakdown data={data} />
        <TranscriptList transcripts={data.spokenContents} onItemClick={handleTranscriptItemClick} />

        <div className="mt-12 text-center">
          <p className="text-4xl font-semibold text-neutral-900 mb-1">+ {data.pointsEarned.toLocaleString()} points</p>
          <Button
            onClick={onContribute}
            className="mt-4 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-2.5 px-8 rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-700 focus:ring-offset-2"
          >
            Contribute &amp; Earn More
          </Button>
        </div>
      </div>

      <TranscriptDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        conversationId={conversationId}
        transcripts={data.spokenContents}
        initialSelectedItemId={initialModalItemId}
      />
    </>
  )
}
