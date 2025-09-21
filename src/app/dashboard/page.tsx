import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ModernDashboardLayout from '@/components/ModernDashboardLayout'
import ModernDashboardContent from '@/components/ModernDashboardContent'

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <ModernDashboardLayout>
      <ModernDashboardContent />
    </ModernDashboardLayout>
  )
}