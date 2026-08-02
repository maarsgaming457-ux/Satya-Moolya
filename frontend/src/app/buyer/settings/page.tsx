"use client"
import { useEffect, useState } from "react"
import { UserSettings } from "@/types/account"
import { accountApi } from "@/services/account.api"
import { SettingsSection } from "@/components/account/SettingsSection"
import { PreferencesPanel, PreferenceItem } from "@/components/account/PreferencesPanel"
import { Shield, Bell, Eye, Paintbrush, Trash2, LogOut } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await accountApi.getSettings()
      setSettings(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleToggle = async (section: keyof UserSettings, key: string, value: boolean) => {
    if (!settings) return
    const newSettings = { 
      ...settings, 
      [section]: { ...settings[section as keyof UserSettings], [key]: value } 
    }
    setSettings(newSettings as UserSettings)
    await accountApi.updateSettings(newSettings)
  }

  if (loading || !settings) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-extrabold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and security.</p>
      </div>

      <SettingsSection title="Notifications" description="Control how we communicate with you." icon={Bell}>
        <PreferencesPanel>
          <PreferenceItem 
            id="emailAlerts" label="Email Alerts" description="Receive important updates via email." 
            checked={settings.notifications.emailAlerts} onCheckedChange={(c) => handleToggle('notifications', 'emailAlerts', c)}
          />
          <PreferenceItem 
            id="pushNotifs" label="Push Notifications" description="Receive real-time push alerts on your devices." 
            checked={settings.notifications.pushNotifications} onCheckedChange={(c) => handleToggle('notifications', 'pushNotifications', c)}
          />
          <PreferenceItem 
            id="orderUpdates" label="Order Updates" description="Get notified when order statuses change." 
            checked={settings.notifications.orderUpdates} onCheckedChange={(c) => handleToggle('notifications', 'orderUpdates', c)}
          />
        </PreferencesPanel>
      </SettingsSection>

      <SettingsSection title="Privacy & Security" description="Manage your data and public presence." icon={Shield}>
        <PreferencesPanel>
          <PreferenceItem 
            id="publicProfile" label="Public Profile" description="Allow other users to see your basic profile." 
            checked={settings.privacy.showProfilePublicly} onCheckedChange={(c) => handleToggle('privacy', 'showProfilePublicly', c)}
          />
          <PreferenceItem 
            id="shareData" label="Data Sharing" description="Share anonymized data with trusted partners." 
            checked={settings.privacy.shareDataWithPartners} onCheckedChange={(c) => handleToggle('privacy', 'shareDataWithPartners', c)}
          />
        </PreferencesPanel>
      </SettingsSection>

      <div className="mt-12 flex flex-col gap-4 border-t border-border/40 pt-8">
        <button 
          disabled
          className="flex items-center justify-center gap-2 bg-secondary text-foreground font-semibold px-6 py-3 rounded-xl opacity-50 cursor-not-allowed w-full sm:w-auto"
          title="Not yet implemented"
        >
          <LogOut className="w-5 h-5" /> Sign Out Everywhere (Coming Soon)
        </button>
        <button 
          disabled
          className="flex items-center justify-center gap-2 bg-destructive/10 text-destructive font-semibold px-6 py-3 rounded-xl opacity-50 cursor-not-allowed w-full sm:w-auto"
          title="Not yet implemented"
        >
          <Trash2 className="w-5 h-5" /> Delete Account (Coming Soon)
        </button>
      </div>

    </div>
  )
}
