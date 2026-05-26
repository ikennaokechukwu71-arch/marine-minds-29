import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/layout/DashboardNav'
import { OceanBackground } from '@/components/ui/OceanBackground'
import { BubbleField } from '@/components/ui/BubbleField'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  const student = user ? await supabase
    .from('students')
    .select('full_name, nickname, avatar_url, is_admin')
    .eq('user_id', user.id)
    .single()
    .then(({ data }: any) => data) : null

  return (
    <div className="relative min-h-screen">
      <OceanBackground />
      <BubbleField />
      <DashboardNav user={user} student={student} />
      <main className="relative z-10 pt-20 pb-24 px-4 md:px-8 max-w-6xl mx-auto">
        {children}
      </main>
      <div className="h-16 md:hidden" />
    </div>
  )
}