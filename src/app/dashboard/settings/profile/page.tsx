import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ChangeEmailForm from '@/components/ChangeEmailForm'

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <ChangeEmailForm user={session.user} />
    </div>
  )
}