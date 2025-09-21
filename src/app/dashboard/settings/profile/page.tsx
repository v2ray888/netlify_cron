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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">个人信息</h2>
        <p className="mt-1 text-sm text-gray-600">更新您的账户邮箱地址</p>
      </div>
      <ChangeEmailForm user={session.user} />
    </div>
  )
}