import { createClient } from '@/lib/supabase/server'
import { DirectoryClient } from '@/components/features/DirectoryClient'

export default async function DirectoryPage() {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  const { data: myLikes } = user ? await supabase
    .from('profile_likes')
    .select('liked_student_id')
    .eq('liker_id', user.id) : { data: [] }

  const likedIds = (myLikes ?? []).map((l: any) => l.liked_student_id)

  return (
    <DirectoryClient
      students={students ?? []}
      currentUserId={user?.id ?? ''}
      likedIds={likedIds}
    />
  )
}
