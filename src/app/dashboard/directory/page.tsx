import { createClient } from '@/lib/supabase/server'
import { DirectoryClient } from '@/components/features/DirectoryClient'

export default async function DirectoryPage() {
  const supabase = createClient() as any

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  return <DirectoryClient students={students ?? []} currentUserId={user?.id ?? ''} />
}
