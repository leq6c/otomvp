"use client"
import { useState, useEffect } from "react"
import { Edit3, Save, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Profile } from "@/types"
import ProfileView from "./profile-view"
import ProfileForm from "./profile-form"

type ProfileManagerProps = {
  profile: Profile
  isEditing: boolean
  onEditToggle: () => void
  onSave: (updatedProfile: Profile) => void
}

export default function ProfileManager({ profile, isEditing, onEditToggle, onSave }: ProfileManagerProps) {
  const [formData, setFormData] = useState<Profile>(profile)

  useEffect(() => {
    setFormData(profile)
  }, [profile, isEditing])

  const handleSave = () => {
    const profileToSave = {
      ...formData,
      age: formData.age === "" ? "" : Number(formData.age) || profile.age,
    }
    onSave(profileToSave)
  }

  const handleCancel = () => {
    setFormData(profile)
    onEditToggle()
  }

  const getUserId = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userId") || "default-user";
    }
    return "default-user";
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-neutral-800">Profile</h1>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onEditToggle}
            className="ml-3 text-neutral-500 hover:text-neutral-700 p-2 rounded-full hover:bg-neutral-100"
            aria-label="Edit profile"
          >
            <Edit3 size={20} />
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="text-neutral-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50"
              aria-label="Cancel edit"
            >
              <XCircle size={20} />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
              aria-label="Save profile"
            >
              <Save size={20} />
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <ProfileForm formData={formData} setFormData={setFormData} onSubmit={handleSave} />
      ) : (
        <ProfileView profile={profile} />
      )}
    </div>
  )
}
