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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">修改密码</h2>
        <p className="mt-1 text-sm text-gray-600">更新您的账户密码</p>
      </div>
      <ChangePasswordForm user={session.user} />
    </div>
  )
}