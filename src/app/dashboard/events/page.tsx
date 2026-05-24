import { createClient } from '@/lib/supabase/server'
import { EventsClient } from '@/components/features/EventsClient'

export default async function EventsPage() {
  const supabase = createClient()

  const { data: upcoming } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })

  const { data: past } = await supabase
    .from('events')
    .select('*')
    .lt('event_date', new Date().toISOString())
    .order('event_date', { ascending: false })
    .limit(5)

  return <EventsClient upcoming={upcoming ?? []} past={past ?? []} />
}
