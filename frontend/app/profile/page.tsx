"use client"

import { useState, useEffect } from "react"
import OtoHeader from "@/components/layout/oto-header"
import OtoFooter from "@/components/layout/oto-footer"
import ContentGrid from "@/components/layout/content-grid"
import UploadedFilesPanel from "@/components/shared/uploaded-files-panel"
import EarningsPanel from "@/components/shared/earnings-panel"
import ProfileManager from "@/components/profile/profile-manager"
import { SkeletonProfileDetails } from "@/components/shared/skeletons"
import { useProfile, useConversations } from "@/hooks/use-api"
import { toast } from "@/hooks/use-toast"
import type { Profile, UploadedFileSummary } from "@/types"
import type { ConversationResponse, UserProfile } from "@/lib/api-service"
import { usePrivy } from "@privy-io/react-auth"

export default function ProfilePage() {
  const {authenticated} = usePrivy();
  const [profileData, setProfileData] = useState<Profile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [historicalFiles, setHistoricalFiles] = useState<UploadedFileSummary[]>([])
  const [totalPoints, setTotalPoints] = useState<number>(0)

  // API hooks
  const { 
    getProfile, 
    updateProfile, 
    profileData: apiProfileData, 
    profileLoading, 
    profileError,
    updateLoading,
    updateError 
  } = useProfile()
  const { getConversations, conversations, conversationsLoading } = useConversations()

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  // Load data when authentication changes to true
  useEffect(() => {
    if (authenticated) {
      loadData()
    }
  }, [authenticated])

  // Update UI when profile data changes
  useEffect(() => {
    if (apiProfileData) {
      const userProfile = apiProfileData as UserProfile
      const profile: Profile = {
        name: userProfile.name || "",
        age: userProfile.age || "",
        nationality: userProfile.nationality || "",
        firstLanguage: userProfile.first_language || "",
        secondLanguages: userProfile.second_languages || "",
        joinedDate: userProfile.created_at || "",
        customField1: userProfile.interests || "",
        customField2: "", // joined date - not in API
        customField3: userProfile.preferred_topics || "",
      }
      setProfileData(profile)
    } else {
      setProfileData({
        name: "",
        age: "",
        nationality: "",
        firstLanguage: "",
        secondLanguages: "",
        joinedDate: "",
        customField1: "",
        customField2: "",
        customField3: "",
      })
    }
  }, [apiProfileData])

  // Update conversations data
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

  const loadData = async () => {
    try {
      // Load profile and conversations in parallel
      await Promise.all([
        getProfile(),
        getConversations()
      ])
    } catch (error) {
      console.error("Failed to load profile data:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
    }
  }

  const handleSaveProfile = async (updatedProfile: Profile) => {
    try {
      const updateData = {
        name: updatedProfile.name || undefined,
        age: updatedProfile.age ? Number(updatedProfile.age) : undefined,
        nationality: updatedProfile.nationality || undefined,
        first_language: updatedProfile.firstLanguage || undefined,
        second_languages: updatedProfile.secondLanguages || undefined,
        interests: updatedProfile.customField1 || undefined,
        preferred_topics: updatedProfile.customField3 || undefined,
      }

      const result = await updateProfile(updateData)
      
      if (result) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated",
        })
        setProfileData(updatedProfile)
        setIsEditing(false)
        
        // Refresh profile data
        await getProfile()
      } else {
        throw new Error(updateError || "Failed to update profile")
      }
    } catch (error) {
      console.error("Failed to save profile:", error)
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-neutral-900">
      <OtoHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
        <ContentGrid
          left={<UploadedFilesPanel activeFileId={null} />}
          main={
            !authenticated ? (
              <div className="flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
                <p className="text-md text-neutral-600">Connect wallet to edit the profile</p>
              </div>
            ) :
            profileLoading || !profileData ? (
              <SkeletonProfileDetails />
            ) : (
              <ProfileManager
                profile={profileData}
                isEditing={isEditing}
                onEditToggle={() => setIsEditing(!isEditing)}
                onSave={handleSaveProfile}
              />
            )
          }
          right={<EarningsPanel />}
        />
      </main>
      <OtoFooter />
    </div>
  )
}
