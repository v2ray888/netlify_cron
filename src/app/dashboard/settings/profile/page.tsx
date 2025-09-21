'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import ChangeEmailForm from '@/components/ChangeEmailForm'

export default function ProfileSettingsPage() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') {
    return <div>加载中...</div>
  }
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="p-6">
      <ChangeEmailForm user={session.user} />
    </div>
  )
}