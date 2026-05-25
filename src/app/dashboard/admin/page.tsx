import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { AdminClient } from '@/components/features/AdminClient'

export default async function AdminPage() {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: studentProfile } = await supabase
    .from('students')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  if (!studentProfile?.is_admin) redirect('/dashboard')

  const admin = createAdminClient() as any

  const [
    { data: pendingMessages },
    { data: flaggedMessages },
    { count: totalStudents },
    { count: totalMessages },
    { data: pendingGallery },
    { data: recentSignups },
    { data: announcements },
    { data: polls },
  ] = await Promise.all([
    admin.from('anonymous_messages').select('*').eq('is_approved', false).eq('is_flagged', false).order('created_at', { ascending: false }),
    admin.from('anonymous_messages').select('*').eq('is_flagged', true),
    admin.from('students').select('*', { count: 'exact', head: true }),
    admin.from('anonymous_messages').select('*', { count: 'exact', head: true }),
    admin.from('gallery_uploads').select('*').eq('is_approved', false).order('created_at', { ascending: false }),
    admin.from('students').select('full_name, email, created_at, user_id').order('created_at', { ascending: false }).limit(10),
    admin.from('announcements').select('*').order('created_at', { ascending: false }),
    admin.from('polls').select('*, poll_options(*)').order('created_at', { ascending: false }),
  ])

  return (
    <AdminClient
      pendingMessages={pendingMessages ?? []}
      flaggedMessages={flaggedMessages ?? []}
      pendingGallery={pendingGallery ?? []}
      recentSignups={recentSignups ?? []}
      announcements={announcements ?? []}
      polls={polls ?? []}
      stats={{
        totalStudents: totalStudents ?? 0,
        totalMessages: totalMessages ?? 0,
        pendingCount: pendingMessages?.length ?? 0,
        flaggedCount: flaggedMessages?.length ?? 0,
      }}
    />
  )
}
