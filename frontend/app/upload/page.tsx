"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import OtoHeader from "@/components/layout/oto-header"
import OtoFooter from "@/components/layout/oto-footer"
import ContentGrid from "@/components/layout/content-grid"
import UploadedFilesPanel from "@/components/shared/uploaded-files-panel"
import EarningsPanel from "@/components/shared/earnings-panel"
import FileUploader from "@/components/upload/file-uploader"
import { useUpload, useConversations } from "@/hooks/use-api"
import { Toaster, toast } from "sonner"
import type { UploadedFileSummary } from "@/types"
import type { ConversationResponse } from "@/lib/api-service"
import { usePrivy } from "@privy-io/react-auth"

export default function UploadPage() {
  const {authenticated} = usePrivy();
  const router = useRouter()
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [historicalFiles, setHistoricalFiles] = useState<UploadedFileSummary[]>([])
  const [totalPoints, setTotalPoints] = useState<number>(0)

  // API hooks
  const { uploadFile, loading: uploadLoading, error: uploadError, progress: uploadProgress, resetProgress } = useUpload()
  const { getConversations, conversations, conversationsLoading } = useConversations()

  // Load conversations on component mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Update UI when conversations change
  useEffect(() => {
    if (conversations && Array.isArray(conversations)) {
      const files: UploadedFileSummary[] = conversations.map((conv: ConversationResponse) => ({
        id: conv.id,
        fileName: conv.file_name,
        status: conv.status,
      }))
      setHistoricalFiles(files)
      
      // Calculate total points from completed conversations
      const points = conversations
        .filter((conv: ConversationResponse) => conv.status === "completed")
        .reduce((total: number, conv: ConversationResponse) => total + conv.points, 0)
      setTotalPoints(points)
    }
  }, [conversations])

  const loadConversations = async () => {
    try {
      await getConversations()
    } catch (error) {
      console.error("Failed to load conversations:", error)
      toast.error("Failed to load your uploaded files")
    }
  }

  const handleStartAnalyzing = async () => {
    if (!fileToUpload) {
      toast.error("Please select a file to upload")
      return
    }

    if (!authenticated) {
      toast.error("Connect wallet to upload files")
      return
    }

    try {
      const result = await uploadFile(fileToUpload)
      
      if (result) {
        toast.success(`${fileToUpload.name} has been uploaded and analysis started`)
        
        // Refresh conversations list
        await loadConversations()
        
        // Clear selected file and reset progress
        setFileToUpload(null)
        resetProgress()
        
        // Optionally navigate to analysis page
        // router.push(`/analysis/${result.id}`)
      } else {
        throw new Error(uploadError || "Upload failed")
      }
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload file")
      // Reset progress on error
      resetProgress()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-neutral-900">
      <Toaster/>
      <OtoHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
        <ContentGrid
          left={<UploadedFilesPanel activeFileId={null} />}
          main={
            <div className="flex flex-col items-center pt-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-1">Oto</h1>
              <p className="text-neutral-600 mb-10">Upload audio to get analysis</p>
              <FileUploader
                onFileSelect={setFileToUpload}
                onStartAnalyzing={handleStartAnalyzing}
                isAnalyzing={uploadLoading}
                uploadedFileName={fileToUpload?.name || null}
                progress={uploadProgress}
              />
            </div>
          }
          right={<EarningsPanel />}
        />
      </main>
      <OtoFooter />
    </div>
  )
}
