"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import OtoHeader from "@/components/layout/oto-header"
import OtoFooter from "@/components/layout/oto-footer"
import ContentGrid from "@/components/layout/content-grid"
import UploadedFilesPanel from "@/components/shared/uploaded-files-panel"
import EarningsPanel from "@/components/shared/earnings-panel"
import AnalysisReport from "@/components/analysis/analysis-report"
import { SkeletonAnalysis, SkeletonEarnings } from "@/components/shared/skeletons"
import { useConversations, useAnalysis } from "@/hooks/use-api"
import { toast } from "@/hooks/use-toast"
import { transformAnalysisData } from "@/lib/data-transformers"
import type { UploadedFileSummary, AnalysisData } from "@/types"
import type { ConversationResponse, AnalysisResponse } from "@/lib/api-service"
import { AlertTriangle, Loader2 } from "lucide-react"
import { apiService } from "@/lib/api-service"
import { usePrivy } from "@privy-io/react-auth"

export default function AnalysisResultPage() {
  const params = useParams()
  const analysisId = typeof params.id === "string" ? params.id : null
  const {ready, authenticated} = usePrivy();

  const [conversation, setConversation] = useState<ConversationResponse | null>(null)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [historicalFiles, setHistoricalFiles] = useState<UploadedFileSummary[]>([])

  // API hooks
  const { getConversations, getConversation, conversations } = useConversations()
  const { getAnalysis, analysisLoading, analysisError } = useAnalysis()

  // Load data on component mount
  const ranMountRef = useRef(false);
  useEffect(() => {
    if (analysisId && !ranMountRef.current) {
      ranMountRef.current = true;
      loadData()
    }
  }, [analysisId])

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

  const loadData = async () => {
    if (!analysisId) return

    try {
      // Load conversations for the panel
      await getConversations()
      
      // Load specific conversation
      const convResult = await getConversation(analysisId)
      if (convResult) {
        console.log("convResult", convResult)
        setConversation(convResult as ConversationResponse)
        
        // If conversation is completed, load analysis
        if ((convResult as ConversationResponse).status === "completed") {
          const analysisResult = await getAnalysis(analysisId)
          if (analysisResult) {
            // Transform backend response to frontend format
            const transformedData = transformAnalysisData(
              analysisResult as any, 
              convResult as ConversationResponse
            )
            setAnalysisData(transformedData)
          }
        }
      }
    } catch (error) {
      console.error("Failed to load analysis data:", error)
      toast({
        title: "Error",
        description: "Failed to load analysis data",
        variant: "destructive",
      })
    }
  }

  const router = useRouter()

  const handleContribute = () => {
    // go to /upload
    router.push("/upload")
  }

  const updateAnalysis = async (analysisId: string) => {
    const res = await apiService.getConversation(analysisId);
    if (res && res.data && res.data.status === "completed") {
      console.log("conversation status is completed")
      const convResult = await getConversation(analysisId)
      if (convResult) {
        setConversation(convResult as ConversationResponse)
        
        // If conversation is completed, load analysis
        if ((convResult as ConversationResponse).status === "completed") {
          const analysisResult = await getAnalysis(analysisId)
          if (analysisResult) {
            // Transform backend response to frontend format
            const transformedData = transformAnalysisData(
              analysisResult as any, 
              convResult as ConversationResponse
            )
            if (JSON.stringify(transformedData) !== JSON.stringify(analysisData)) {
              setAnalysisData(transformedData)
            }
          }
        }
      }
    }
  };

  // polling conversation status if it is processing
  useEffect(() => {
    console.log("checking conversation status", analysisId, conversation)
    if (analysisId && conversation && conversation.status != "completed" && conversation.status != "failed") {
      console.log("polling conversation status started", analysisId, conversation)
      const interval = setInterval(async() => {
        console.log("polling conversation status")
        const res = await apiService.getConversation(analysisId);
        if (res && res.data && res.data.status === "completed") {
          console.log("conversation status is completed")
          await updateAnalysis(analysisId)
          clearInterval(interval)
        }
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [conversation, analysisId, authenticated])

  const ranAuthenticatedRef = useRef(false);

  useEffect(() => {
    if (authenticated && analysisId && !analysisData && !ranAuthenticatedRef.current) {
        ranAuthenticatedRef.current = true;
        updateAnalysis(analysisId)
    }
  }, [authenticated])

  const mainContent = () => {
    if (!authenticated) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
          <p className="text-md text-neutral-600">Connect wallet to show the analysis result</p>
        </div>
      )
    }

    if (!conversation) return <SkeletonAnalysis />
    if (!conversation) return <p className="text-lg text-neutral-600 text-center mt-10">Analysis not found.</p>

    if (conversation.status === "processing" || conversation.status === "not_started") {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
          <Loader2 className="w-12 h-12 text-neutral-500 mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-neutral-700 mb-2">Analysis in Progress</h2>
          <p className="text-neutral-600">
            The analysis for "<span className="font-medium">{conversation.file_name}</span>" is still processing.
          </p>
          <p className="text-neutral-600 mt-1">Please check back later for the results.</p>
          <p className="text-neutral-600 mt-4 text-xs">Usually it takes 1-3 minutes to complete the analysis for an hour long conversation.</p>
        </div>
      )
    }

    if (conversation.status === "failed") {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10 bg-red-50 border border-red-200 rounded-lg min-h-[300px]">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Analysis Failed</h2>
          <p className="text-neutral-600">
            The analysis for "<span className="font-medium">{conversation.file_name}</span>" failed to complete.
          </p>
          <p className="text-neutral-600 mt-1">Please try uploading the file again.</p>
        </div>
      )
    }


    // Status is 'completed'
    if (!analysisData) {
      return <SkeletonAnalysis />
    }

    return (
      <>
        {conversation.file_name && (
          <h1 className="text-2xl font-semibold text-neutral-800 mb-6">
            Analysis
          </h1>
        )}
        <AnalysisReport data={analysisData} conversationId={analysisId || ""} onContribute={handleContribute} />
      </>
    )
  }

  const earningsContent = () => {
    return <EarningsPanel />
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-neutral-900">
      <OtoHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
        <ContentGrid
          left={<UploadedFilesPanel activeFileId={analysisId} />}
          main={mainContent()}
          right={earningsContent()}
        />
      </main>
      <OtoFooter />
    </div>
  )
}
