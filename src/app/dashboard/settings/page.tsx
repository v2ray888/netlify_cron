import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ModernDashboardLayout from '@/components/ModernDashboardLayout'
import UserSettingsTabs from '@/components/UserSettingsTabs'

export default async function UserSettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <ModernDashboardLayout>
      <UserSettingsTabs user={session.user} />
    </ModernDashboardLayout>
  )
}