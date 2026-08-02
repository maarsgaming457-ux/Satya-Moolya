import Image from "next/image"
import { UserProfile } from "@/types/account"
import { ShieldCheck, Mail, Phone, Calendar, UserCheck } from "lucide-react"

export function ProfileCard({ profile }: { profile: UserProfile }) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-sm">
      
      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4 shrink-0">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-lg">
          <Image 
            src={profile.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=80"} 
            alt={profile.name} 
            fill 
            className="object-cover"
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" /> ID Verified
          </div>
          <span className="text-xs text-muted-foreground font-medium">Role: {profile.role}</span>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-col justify-center flex-1 gap-6">
        <div>
          <h2 className="text-3xl font-heading font-extrabold tracking-tight mb-1">{profile.name}</h2>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> {profile.email}</span>
            <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> {profile.phone}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Member Since</span>
              <span className="font-semibold text-sm">{new Date(profile.memberSince).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-success" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</span>
              <span className="font-semibold text-sm text-success">{profile.verificationStatus}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
