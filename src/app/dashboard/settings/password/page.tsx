'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import ChangePasswordForm from '@/components/ChangePasswordForm'

export default function PasswordSettingsPage() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') {
    return <div>加载中...</div>
  }
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="p-6">
      <ChangePasswordForm user={session.user} />
    </div>
  )
}