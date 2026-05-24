import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminClient } from '@/components/features/AdminClient'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: studentProfile } = await supabase
    .from('students')
    .select('is_admin')
    .eq('user_id', user.id)
    .single() as { data: { is_admin: boolean } | null, error: unknown }

  if (!studentProfile?.is_admin) redirect('/dashboard')

  const [
    { data: pendingMessages },
    { data: flaggedMessages },
    { count: totalStudents },
    { count: totalMessages },
    { data: pendingGallery },
    { data: recentSignups },
  ] = await Promise.all([
    supabase.from('anonymous_messages').select('*').eq('is_approved', false).eq('is_flagged', false).order('created_at', { ascending: false }),
    supabase.from('anonymous_messages').select('*').eq('is_flagged', true),
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('anonymous_messages').select('*', { count: 'exact', head: true }),
    supabase.from('gallery_uploads').select('*').eq('is_approved', false).order('created_at', { ascending: false }),
    supabase.from('students').select('full_name, email, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <AdminClient
      pendingMessages={pendingMessages ?? []}
      flaggedMessages={flaggedMessages ?? []}
      pendingGallery={pendingGallery ?? []}
      recentSignups={recentSignups ?? []}
      stats={{
        totalStudents: totalStudents ?? 0,
        totalMessages: totalMessages ?? 0,
        pendingCount: pendingMessages?.length ?? 0,
        flaggedCount: flaggedMessages?.length ?? 0,
      }}
    />
  )
}
