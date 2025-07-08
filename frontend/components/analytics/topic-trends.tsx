"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Topic, MicroTrend } from "@/types"
import TopicDetailModal from "./topic-detail-modal"

type TopicTrendsProps = {
  topics: Topic[]
  microTrends: MicroTrend[]
}

const TrendIcon = ({ trend }: { trend: Topic["trend"] }) => {
  switch (trend) {
    case "up":
      return <TrendingUp className="w-4 h-4 text-green-500" aria-label="Trending up" />
    case "down":
      return <TrendingDown className="w-4 h-4 text-red-500" aria-label="Trending down" />
    default:
      return <Minus className="w-4 h-4 text-neutral-400" aria-label="Trend stable" />
  }
}

const SentimentIndicator = ({ sentiment }: { sentiment: MicroTrend["sentiment"] }) => {
  const sentimentColor = {
    positive: "bg-green-500",
    neutral: "bg-neutral-400",
    mixed: "bg-yellow-500",
  }[sentiment]

  return (
    <span
      className={cn("w-2 h-2 rounded-full inline-block mr-2 shrink-0", sentimentColor)}
      aria-label={`${sentiment} sentiment`}
    ></span>
  )
}

export default function TopicTrends({ topics, microTrends }: TopicTrendsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)

  const handleTopicCardClick = (topic: Topic) => {
    return
    setSelectedTopic(topic)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTopic(null)
  }

  return (
    <>
      <div className="w-full">
        <h1 className="text-3xl font-semibold text-neutral-800 mb-8">Global Conversation Trends</h1>

        <div className="relative mb-12">
          <div className="flex space-x-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-neutral-100 scrollbar-thumb-rounded-full">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleTopicCardClick(topic)}
                className="flex-shrink-0 w-64 h-40 bg-neutral-100/70 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-labelledby={`topic-name-${topic.id}`}
                aria-describedby={`topic-desc-${topic.id}`}
              >
                <div>
                  <h3
                    id={`topic-name-${topic.id}`}
                    className="text-md font-semibold text-neutral-700 mb-2 truncate"
                    title={topic.name}
                  >
                    {topic.name}
                  </h3>
                  <p
                    id={`topic-desc-${topic.id}`}
                    className="text-xs text-neutral-600 line-clamp-3"
                    title={topic.shortDescription}
                  >
                    {topic.shortDescription}
                  </p>
                </div>
                <div className="mt-auto pt-3">
                  <div className="flex items-center justify-between">
                    <div className="w-full bg-neutral-200 rounded-full h-1.5 mr-3" title={`Volume: ${topic.volume}%`}>
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${topic.volume}%` }}
                        aria-valuenow={topic.volume}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        role="progressbar"
                      ></div>
                    </div>
                    <TrendIcon trend={topic.trend} />
                  </div>
                </div>
              </button>
            ))}
            {topics.length > 3 && <div className="flex-shrink-0 w-px h-px"></div>}
          </div>
          {topics.length > 3 && (
            <p className="text-xs text-neutral-500 mt-1 text-center italic">Scroll horizontally to view more topics.</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-neutral-700 mb-5">Emerging Micro-Trends</h2>
          {microTrends.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {microTrends.map((mTrend) => (
                <div
                  key={mTrend.id}
                  className="bg-neutral-100/70 hover:bg-neutral-200/70 transition-colors text-neutral-700 text-xs font-medium px-3 py-1.5 rounded-full flex items-center cursor-default"
                  title={mTrend.name}
                >
                  <SentimentIndicator sentiment={mTrend.sentiment} />
                  <span className="truncate">{mTrend.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No micro-trends identified currently.</p>
          )}
        </div>
      </div>
      <TopicDetailModal isOpen={isModalOpen} onClose={handleCloseModal} topic={selectedTopic} />
    </>
  )
}
