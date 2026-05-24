import { createClient } from '@/lib/supabase/server'
import { AnonWallClient } from '@/components/features/AnonWallClient'

export default async function ConfessionsPage() {
  const supabase = createClient() as any

  const { data: messages } = await supabase
    .from('anonymous_messages')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: featured } = await supabase
    .from('anonymous_messages')
    .select('*')
    .eq('is_approved', true)
    .eq('is_featured', true)
    .order('likes_count', { ascending: false })
    .limit(1)
    .single()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: userReactions } = await supabase
    .from('reactions')
    .select('message_id, reaction_type')
    .eq('user_id', user?.id ?? '')

  return (
    <AnonWallClient
      messages={messages ?? []}
      featuredMessage={featured ?? null}
      userReactions={userReactions ?? []}
      userId={user?.id ?? ''}
    />
  )
}
