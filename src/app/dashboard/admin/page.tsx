import { createClient } from '@/lib/supabase/server'
import { DashboardHome } from '@/components/features/DashboardHome'

export default async function DashboardPage() {
  const supabase = createClient() as any

  const [
    { count: studentCount },
    { count: messageCount },
    { count: galleryCount },
    { data: mostLiked },
    { data: mostMentioned },
    { data: topGallery },
    { data: announcements },
    { data: upcomingEvents },
    { data: todayBirthdays },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('anonymous_messages').select('*', { count: 'exact', head: true }).eq('is_approved', true),
    supabase.from('gallery_uploads').select('*', { count: 'exact', head: true }).eq('is_approved', true),
    supabase
      .from('students')
      .select('id, full_name, nickname, avatar_url, likes_count')
      .order('likes_count', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('students')
      .select('id, full_name, nickname, avatar_url, mentions_count')
      .order('mentions_count', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('gallery_uploads')
      .select('uploaded_by, students(id, full_name, nickname, avatar_url)')
      .eq('is_approved', true),
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

  // Count gallery uploads per student
  const galleryCounts: Record<string, { count: number; student: any }> = {}
  for (const row of topGallery ?? []) {
    if (!row.uploaded_by) continue
    if (!galleryCounts[row.uploaded_by]) {
      galleryCounts[row.uploaded_by] = { count: 0, student: row.students }
    }
    galleryCounts[row.uploaded_by].count++
  }
  const topUploader = Object.values(galleryCounts).sort((a, b) => b.count - a.count)[0]

  const categories = [
    {
      label: 'Most liked profile',
      emoji: '❤️',
      student: mostLiked ?? null,
      score: mostLiked?.likes_count ?? 0,
    },
    {
      label: 'Most anonymous mentions',
      emoji: '🌑',
      student: mostMentioned ?? null,
      score: mostMentioned?.mentions_count ?? 0,
    },
    {
      label: 'Top gallery uploads',
      emoji: '📸',
      student: topUploader?.student ?? null,
      score: topUploader?.count ?? 0,
    },
  ]

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
      leaderboardCategories={categories}
      announcements={announcements ?? []}
      upcomingEvents={upcomingEvents ?? []}
      birthdaysToday={birthdaysToday}
    />
  )
}
