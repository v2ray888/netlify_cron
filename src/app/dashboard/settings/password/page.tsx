import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ChangePasswordForm from '@/components/ChangePasswordForm'

export default async function PasswordSettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <ChangePasswordForm user={session.user} />
    </div>
  )
}