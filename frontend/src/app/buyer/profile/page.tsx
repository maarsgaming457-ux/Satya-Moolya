"use client"
import { useEffect, useState } from "react"
import { UserProfile } from "@/types/account"
import { accountApi } from "@/services/account.api"
import { authService } from "@/services/api/auth.service"
import { ProfileCard } from "@/components/account/ProfileCard"
import { StatsGrid } from "@/components/account/StatsGrid"
import { AddressCard } from "@/components/account/AddressCard"
import { Edit, Plus } from "lucide-react"

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await authService.getCurrentUser()
        const user = res.data
        if (user) {
          setProfile({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: "+91", // Not provided by backend yet
            avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}`,
            memberSince: user.createdAt,
            verificationStatus: user.isEmailVerified ? "Verified" : "Pending",
            govIdStatus: "Pending",
            role: user.role,
            stats: {
              orders: 0,
              listings: 0,
              negotiations: 0,
              aiReports: 0
            },
            addresses: []
          })
        }
      } catch (e) {
        console.error("Failed to load profile", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading || !profile) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-extrabold tracking-tight mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and addresses.</p>
        </div>
        <button className="hidden md:flex items-center gap-2 bg-secondary text-foreground font-semibold px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors">
          <Edit className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      <div className="flex flex-col gap-8">
        <ProfileCard profile={profile} />
        
        <StatsGrid stats={profile.stats} />

        <section className="mt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Saved Addresses</h2>
            <button className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              <Plus className="w-4 h-4" /> Add New
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.addresses.map(address => (
              <AddressCard key={address.id} address={address} />
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
