"use client"

import type React from "react"
import { useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { UploadCloud } from "lucide-react"
import { toast } from "sonner"

type FileUploaderProps = {
  onFileSelect: (file: File) => void
  onStartAnalyzing: () => void
  isAnalyzing: boolean
  uploadedFileName: string | null
  progress: number
}

export default function FileUploader({
  onFileSelect,
  onStartAnalyzing,
  isAnalyzing,
  uploadedFileName,
  progress,
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadAreaClick = useCallback(() => {
    if (isAnalyzing || !fileInputRef.current) return
    fileInputRef.current.click()
  }, [isAnalyzing])

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file?.size && file.size > 300 * 1024 * 1024) {
        toast.error("File size must be less than 300MB")
        return
      }
      if (file) {
        onFileSelect(file)
      }
      if (event.target) {
        event.target.value = ""
      }
    },
    [onFileSelect],
  )

  return (
    <div className="w-full max-w-md flex flex-col items-center text-center">
      <div
        role="button"
        tabIndex={0}
        aria-label={
          uploadedFileName ? `Selected file: ${uploadedFileName}. Click to change.` : "Upload your conversation data"
        }
        className={`p-8 w-full h-48 border border-neutral-300 bg-neutral-100/10 rounded-2xl flex flex-col items-center justify-center mb-10 ${
          isAnalyzing ? "cursor-default opacity-70" : "cursor-pointer hover:border-neutral-400 hover:bg-neutral-100"
        } transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2`}
        onClick={handleUploadAreaClick}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !isAnalyzing && handleUploadAreaClick()}
      >
        <UploadCloud
        strokeWidth={1}
          className={`w-12 h-12 ${isAnalyzing ? "text-neutral-400" : "text-neutral-500"} mb-2 transition-colors`}
        />
        <p className={`text-md ${isAnalyzing ? "text-neutral-500" : "text-gray-900"} transition-colors`}>
          {uploadedFileName ? <span className="font-medium">{uploadedFileName}</span> : "Click to upload audio"}
        </p>
        <p className="text-xs text-neutral-400 mt-1">Supports mp3, wav, m4a</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="audio/*,.mp3,.wav,.m4a"
          disabled={isAnalyzing}
        />
      </div>

      {isAnalyzing ? (
        <div className="w-full px-4">
          <Progress value={progress} className="w-full h-2 mb-2 bg-neutral-200 [&>div]:bg-blue-600" />
          <p className="text-sm text-neutral-600 animate-pulse">Uploading your audio...</p>
        </div>
      ) : (
        <Button
          onClick={onStartAnalyzing}
          //disabled={!uploadedFileName || isAnalyzing}
          className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3 px-12 rounded-full text-base w-full sm:w-auto transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-700 focus:ring-offset-2 disabled:opacity-50"
        >
          Start Analyzing
        </Button>
      )}
    </div>
  )
}
