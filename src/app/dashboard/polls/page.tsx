import { createClient } from '@/lib/supabase/server'
import { PollsClient } from '@/components/features/PollsClient'

export default async function PollsPage() {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  const { data: polls } = await supabase
    .from('polls')
    .select(`
      *,
      poll_options (*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const { data: userVotes } = await supabase
    .from('poll_votes')
    .select('poll_id, option_id')
    .eq('user_id', user?.id ?? '')

  return (
    <PollsClient
      polls={polls ?? []}
      userVotes={userVotes ?? []}
      userId={user?.id ?? ''}
    />
  )
}
