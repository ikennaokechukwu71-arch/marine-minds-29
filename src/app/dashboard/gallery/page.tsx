import { createClient } from '@/lib/supabase/server'
import { GalleryClient } from '@/components/features/GalleryClient'

export default async function GalleryPage() {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  const { data: uploads } = await supabase
    .from('gallery_uploads')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  return <GalleryClient uploads={uploads ?? []} userId={user?.id ?? ''} />
}