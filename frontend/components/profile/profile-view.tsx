import type { Profile } from "@/types"

const ProfileItem = ({ label, value }: { label: string; value?: string | number }) => {
  const displayValue = value !== undefined && value !== "" ? value : "Not specified"
  const valueIsEmpty = value === undefined || value === ""

  return (
    <div className="mb-4">
      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-neutral-800 ${valueIsEmpty ? "italic text-neutral-400" : ""}`}>{displayValue}</p>
    </div>
  )
}

export default function ProfileView({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-5">
      <ProfileItem label="Name" value={profile.name} />
      <ProfileItem label="Age" value={profile.age} />
      <ProfileItem label="Nationality" value={profile.nationality} />
      <ProfileItem label="First Language" value={profile.firstLanguage} />
      <ProfileItem label="Second Languages" value={profile.secondLanguages} />
      <ProfileItem label="Interests" value={profile.customField1} />
      <ProfileItem label="Joined Date" value={profile.joinedDate} />
      <ProfileItem label="Preferred Topics" value={profile.customField3} />
    </div>
  )
}
