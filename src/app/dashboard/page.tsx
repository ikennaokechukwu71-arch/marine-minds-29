import { createClient } from '@/lib/supabase/server'
import { DashboardHome } from '@/components/features/DashboardHome'

export default async function DashboardPage() {
  const supabase = createClient()

  const [
    { count: studentCount },
    { count: messageCount },
    { count: galleryCount },
    { data: topStudents },
    { data: announcements },
    { data: upcomingEvents },
    { data: todayBirthdays },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('anonymous_messages').select('*', { count: 'exact', head: true }).eq('is_approved', true),
    supabase.from('gallery_uploads').select('*', { count: 'exact', head: true }).eq('is_approved', true),
    supabase
      .from('students')
      .select('id, full_name, nickname, avatar_url, likes_count, mentions_count')
      .order('likes_count', { ascending: false })
      .limit(5),
    supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(3),
    supabase
      .from('students')
      .select('full_name, nickname, birthday')
      .not('birthday', 'is', null),
  ])

  const birthdaysToday = (todayBirthdays ?? []).filter(s => {
    if (!s.birthday) return false
    const b = new Date(s.birthday)
    const today = new Date()
    return b.getMonth() === today.getMonth() && b.getDate() === today.getDate()
  })

  return (
    <DashboardHome
      stats={{
        students: studentCount ?? 0,
        messages: messageCount ?? 0,
        gallery: galleryCount ?? 0,
      }}
      topStudents={topStudents ?? []}
      announcements={announcements ?? []}
      upcomingEvents={upcomingEvents ?? []}
      birthdaysToday={birthdaysToday}
    />
  )
}
