"use client"

import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import type { UploadedFileSummary } from "@/types" // Ensure this type is imported
import { SkeletonUploadedFiles } from "./skeletons"
import { useEffect, useState } from "react"
import { apiService } from "@/lib/api-service";
import { usePrivy } from "@privy-io/react-auth";
import { useUploadedFiles } from "@/app/contexts/uploaded_files_context";

const StatusIndicator = ({ status }: { status: "completed" | "processing" | "failed" | "not_started" }) => {
  if (status === "completed") {
    return <span className="w-2.5 h-2.5 min-w-2.5 bg-green-500 rounded-full opacity-0" title="Analysis Completed"></span>
  }
  if (status === "failed") {
    return <span className="w-2.5 h-2.5 min-w-2.5 bg-red-500 rounded-full opacity-75" title="Analysis Failed"></span>
  }
  // Processing status: animated pulsing dot
  return (
    <span className="relative flex h-2.5 w-2.5 min-w-2.5" title="Analysis Processing">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
    </span>
  )
}

export default function UploadedFilesPanel({
  activeFileId,
}: { 
  activeFileId: string | null;
}) {
  const {authenticated} = usePrivy();
  const { uploadedFiles, setUploadedFiles } = useUploadedFiles();

  const router = useRouter()

  const handleFileSelect = (fileId: string) => {
    router.push(`/analysis/${fileId}`)
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-neutral-800">Uploaded files</h2>
      {!authenticated ? (
        <p className="text-sm text-neutral-500">Connect wallet to show the list</p>
      ) : uploadedFiles == null ? (
        <SkeletonUploadedFiles />
      ) : uploadedFiles.length > 0 ? (
        <ul className="space-y-1 text-sm text-neutral-700 max-h-[420px] overflow-y-auto">
          {uploadedFiles.map((file) => (
            <li key={file.id}>
              <button
                onClick={() => handleFileSelect(file.id)}
                className={cn(
                  "text-left w-full px-2 py-1.5 rounded hover:bg-neutral-100 focus:outline-none focus:bg-neutral-100 transition-colors flex items-center justify-between group",
                )}
                title={`View analysis for ${file.fileName}`}
              >
                <span
                  className={cn(
                    "truncate flex-grow pr-2",
                    activeFileId === file.id
                      ? "text-neutral-700 font-semibold"
                      : "text-neutral-700 group-hover:text-neutral-900",
                  )}
                >
                  {file.fileName}
                </span>
                <StatusIndicator status={file.status} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">No files uploaded yet.</p>
      )}
    </div>
  )
}
