"use client"
import { X, Loader2 } from "lucide-react"
import type { SpokenContent, TranscriptSegment, FullTranscript } from "@/types"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"
import { useTranscript } from "@/hooks/use-api"
import { toast } from "@/hooks/use-toast"

type TranscriptDetailModalProps = {
  isOpen: boolean
  onClose: () => void
  conversationId: string
  transcripts: SpokenContent[]
  initialSelectedItemId?: string
}

// Helper function to format time from seconds to MM:SS or HH:MM:SS
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// Helper function to check if a transcript segment matches the selected highlight timestamp
const isSegmentInTimeRange = (segment: TranscriptSegment, targetTimestamp?: string): boolean => {
  if (!targetTimestamp) return false
  
  // Parse the target timestamp (e.g., "1:23-1:45" or "1:23")
  const timeRange = targetTimestamp.includes('-') ? targetTimestamp.split('-') : [targetTimestamp]
  const startTime = timeRange[0].trim()
  const endTime = timeRange[1]?.trim() || startTime
  
  // Convert MM:SS or HH:MM:SS to seconds
  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number)
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1] // MM:SS
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2] // HH:MM:SS
    }
    return 0
  }
  
  const targetStart = parseTimeToSeconds(startTime)
  const targetEnd = parseTimeToSeconds(endTime)

  const timecodestr = segment.timecode.split('-')[0]
  const timecode = parseTimeToSeconds(timecodestr.trim());

  // Check if segment overlaps with target time range
  return (timecode <= targetEnd && timecode >= targetStart)
}

const ModalTranscriptItem = ({
  segment,
  isSelected,
  isHighlighted,
  onClick,
  itemRef,
}: {
  segment: TranscriptSegment
  isSelected?: boolean
  isHighlighted?: boolean
  onClick: () => void
  itemRef: (el: HTMLLIElement | null) => void
}) => {
  return (
    <li
      ref={itemRef}
      onClick={onClick}
      className={cn(
        "py-3 px-4 rounded-lg transition-all duration-200 cursor-pointer",
        isSelected ? "bg-blue-100/80 ring-2 ring-blue-500 shadow-lg scale-[1.01]" : 
        //isHighlighted ? "bg-yellow-50/80 border border-yellow-200" :
        "bg-white/50 hover:bg-white/70",
        !isSelected && "opacity-80 hover:opacity-100",
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
    >
      <p className={cn("text-xs mb-1", 
        isSelected ? "text-blue-700 font-medium" : 
        //isHighlighted ? "text-yellow-700 font-medium" :
        "text-neutral-600"
      )}>
        {segment.timecode}
      </p>
      <p className={cn("text-sm", 
        isSelected ? "text-neutral-900 font-semibold" : 
        isHighlighted ? "text-neutral-800 font-medium" :
        "text-neutral-900"
      )}>
        {segment.caption}
      </p>
    </li>
  )
}

export default function TranscriptDetailModal({
  isOpen,
  onClose,
  conversationId,
  transcripts,
  initialSelectedItemId,
}: TranscriptDetailModalProps) {
  const [currentSelectedSegmentId, setCurrentSelectedSegmentId] = useState<number | undefined>()
  const [fullTranscript, setFullTranscript] = useState<FullTranscript | null>(null)
  const scrollContainerRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<Map<number, HTMLLIElement | null>>(new Map())
  
  // API hook for fetching transcript
  const { getTranscript, transcriptData, transcriptLoading, transcriptError } = useTranscript()
  
  // Find the selected highlight to match with transcript
  const selectedHighlight = transcripts.find(t => t.id === initialSelectedItemId)

  // Load transcript when modal opens
  useEffect(() => {
    if (isOpen && conversationId) {
      loadTranscript()
    }
  }, [isOpen, conversationId])

  // Update transcript data when API response changes
  useEffect(() => {
    if (transcriptData) {
      console.log("transcriptData", transcriptData)
      setFullTranscript(transcriptData as FullTranscript)
    }
  }, [transcriptData])

  // Auto-select and scroll to matching segment when transcript loads
  useEffect(() => {
    if (fullTranscript && selectedHighlight?.timestamp) {
      // Find the segment that matches the selected highlight timestamp
      const matchingSegment = fullTranscript.captions.find(segment =>
        isSegmentInTimeRange(segment, selectedHighlight.timestamp)
      )
      
      if (matchingSegment) {
        setCurrentSelectedSegmentId(matchingSegment.id)
      }
    }
  }, [fullTranscript, selectedHighlight])

  // Handle scrolling whenever the selected segment changes
  useEffect(() => {
    if (currentSelectedSegmentId !== undefined) {
      setTimeout(() => {
        const selectedElement = itemRefs.current.get(currentSelectedSegmentId)
        if (selectedElement) {
          selectedElement.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 100);
      
    }
  }, [currentSelectedSegmentId, transcriptLoading])

  const loadTranscript = async () => {
    try {
      await getTranscript(conversationId)
    } catch (error) {
      console.error("Failed to load transcript:", error)
      toast({
        title: "Error",
        description: "Failed to load full transcript",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    onClose()
    setCurrentSelectedSegmentId(undefined)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transcript-modal-title"
    >
      <div
        className="bg-white backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg text-neutral-800 border border-white/40 flex flex-col"
        style={{ maxHeight: "60vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 id="transcript-modal-title" className="text-lg font-semibold text-neutral-700">
            Transcript Context
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-neutral-500/20 text-neutral-600 hover:text-neutral-800 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {transcriptLoading ? (
          <div className="flex items-center justify-center py-8 flex-grow">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
            <span className="ml-2 text-sm text-neutral-500">Loading full transcript...</span>
          </div>
        ) : transcriptError ? (
          <div className="text-center py-8 flex-grow">
            <p className="text-sm text-red-500 mb-2">Failed to load transcript</p>
            <button 
              onClick={loadTranscript}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Try again
            </button>
          </div>
        ) : fullTranscript && fullTranscript.captions.length > 0 ? (
          <ul ref={scrollContainerRef} className="space-y-3 overflow-y-auto pr-4 -mr-2 flex-grow pl-2 pt-4 pb-4">
            {fullTranscript.captions.map((segment) => (
              <ModalTranscriptItem
                key={segment.id}
                segment={segment}
                isSelected={segment.id === currentSelectedSegmentId}
                isHighlighted={selectedHighlight?.timestamp ? isSegmentInTimeRange(segment, selectedHighlight.timestamp) : false}
                onClick={() => setCurrentSelectedSegmentId(segment.id)}
                itemRef={(el) => itemRefs.current.set(segment.id, el)}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500 text-center py-4 italic flex-grow">No transcript available.</p>
        )}
      </div>
    </div>
  )
}
