import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UserSettingsTabs from '@/components/UserSettingsTabs'

export default async function UserSettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserSettingsTabs user={session.user} />
    </div>
  )
}