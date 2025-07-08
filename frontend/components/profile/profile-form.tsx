"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Profile } from "@/types"

type ProfileFormProps = {
  formData: Profile
  setFormData: React.Dispatch<React.SetStateAction<Profile>>
  onSubmit: () => void
}

const EditableProfileField = ({
  label,
  id,
  value,
  onChange,
  placeholder,
  disabled = false,
  type = "text",
}: {
  label: string
  id: keyof Profile
  value: string | number | undefined
  onChange: (id: keyof Profile, value: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
}) => (
  <div className="mb-4">
    <Label htmlFor={id} className="text-xs text-neutral-500 uppercase tracking-wider mb-1.5 block">
      {label}
    </Label>
    <Input
      id={id}
      name={id}
      type={type}
      value={value || ""}
      onChange={(e) => onChange(id, e.target.value)}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      className="bg-white border-neutral-300 focus:border-blue-500 focus:ring-blue-500"
      disabled={disabled}
    />
  </div>
)

export default function ProfileForm({ formData, setFormData, onSubmit }: ProfileFormProps) {
  const handleChange = (id: keyof Profile, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="space-y-1"
    >
      <EditableProfileField label="Name" id="name" value={formData.name} onChange={handleChange} />
      <EditableProfileField label="Age" id="age" type="number" value={formData.age} onChange={handleChange} />
      <EditableProfileField label="Nationality" id="nationality" value={formData.nationality} onChange={handleChange} />
      <EditableProfileField
        label="First Language"
        id="firstLanguage"
        value={formData.firstLanguage}
        onChange={handleChange}
      />
      <EditableProfileField
        label="Second Languages"
        id="secondLanguages"
        value={formData.secondLanguages}
        onChange={handleChange}
      />
      <EditableProfileField label="Interests" id="customField1" value={formData.customField1} onChange={handleChange} />
      <EditableProfileField
        label="Joined Date"
        id="joinedDate"
        value={formData.joinedDate}
        onChange={handleChange}
        disabled={true}
      />
      <EditableProfileField
        label="Preferred Topics"
        id="customField3"
        value={formData.customField3}
        onChange={handleChange}
      />
    </form>
  )
}
