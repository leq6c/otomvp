"use client"

import { useState, useEffect } from "react"
import OtoHeader from "@/components/layout/oto-header"
import OtoFooter from "@/components/layout/oto-footer"
import ContentGrid from "@/components/layout/content-grid"
import UploadedFilesPanel from "@/components/shared/uploaded-files-panel"
import EarningsPanel from "@/components/shared/earnings-panel"
import TopicTrends from "@/components/analytics/topic-trends"
import { SkeletonTopicTrends, SkeletonUploadedFiles, SkeletonEarnings } from "@/components/shared/skeletons"
import { useConversations, usePoints, useTrends } from "@/hooks/use-api"
import { toast } from "@/hooks/use-toast"
import {
  transformTrendsData,
  transformMicroTrendsData,
} from "@/lib/data-transformers"
import type { Topic, MicroTrend, UploadedFileSummary } from "@/types"
import type { ConversationResponse, PointResponse } from "@/lib/api-service"
import { usePrivy } from "@privy-io/react-auth"

export default function AnalyticsPage() {
  const {authenticated} = usePrivy();
  const [trendingTopics, setTrendingTopics] = useState<Topic[]>([])
  const [microTrends, setMicroTrends] = useState<MicroTrend[]>([])
  const [historicalFiles, setHistoricalFiles] = useState<UploadedFileSummary[]>([])
  const [totalPoints, setTotalPoints] = useState<number>(0)

  // API hooks
  const { getConversations, conversations, conversationsLoading, conversationsError } = useConversations()
  const { getPoints, pointsData, pointsLoading, pointsError } = usePoints()
  const { getTrends, getMicroTrends, trends, microTrends: apiMicroTrends, trendsLoading: apiTrendsLoading, microTrendsLoading, trendsError, microTrendsError } = useTrends()

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  // Update historical files when conversations change
  useEffect(() => {
    if (conversations && Array.isArray(conversations)) {
      const files: UploadedFileSummary[] = conversations.map((conv: ConversationResponse) => ({
        id: conv.id,
        fileName: conv.file_name,
        status: conv.status,
      }))
      setHistoricalFiles(files)
    }
  }, [conversations])

  // Update total points when points data changes
  useEffect(() => {
    if (pointsData) {
      setTotalPoints((pointsData as PointResponse).points)
    }
  }, [pointsData])

  // Update trends when API data changes
  useEffect(() => {
    if (trends && Array.isArray(trends)) {
      const transformedTrends = transformTrendsData(trends)
      setTrendingTopics(transformedTrends)
    }
  }, [trends])

  // Update microtrends when API data changes
  useEffect(() => {
    if (apiMicroTrends && Array.isArray(apiMicroTrends)) {
      const transformedMicroTrends = transformMicroTrendsData(apiMicroTrends)
      setMicroTrends(transformedMicroTrends)
    }
  }, [apiMicroTrends])

  const loadData = async () => {
    try {
      // Load conversations, points, trends, and microtrends in parallel
      await Promise.all([
        getConversations(),
        getPoints(),
        getTrends(),
        getMicroTrends()
      ])
    } catch (error) {
      console.error("Failed to load analytics data:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
    }
  }

  const isLoading = conversationsLoading || pointsLoading
  const trendsDataLoading = apiTrendsLoading || microTrendsLoading || trendingTopics.length === 0

  return (
    <div className="flex flex-col min-h-screen bg-white text-neutral-900">
      <OtoHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
        <ContentGrid
          left={
            <UploadedFilesPanel 
              activeFileId={null} 
            />
          }
          main={
            trendsDataLoading ? 
              <SkeletonTopicTrends /> : 
              <TopicTrends topics={trendingTopics} microTrends={microTrends} />
          }
          right={
            isLoading && !authenticated ? 
              <SkeletonEarnings /> : 
              <EarningsPanel />
          }
        />
      </main>
      <OtoFooter />
    </div>
  )
}
