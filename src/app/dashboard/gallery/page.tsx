import { createClient } from '@/lib/supabase/server'
import { GalleryClient } from '@/components/features/GalleryClient'

export default async function GalleryPage() {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  const { data: uploads, error } = await supabase
    .from('gallery_uploads')
    .select(`*, students(full_name, nickname)`)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  console.log('GALLERY UPLOADS:', uploads)
  console.log('GALLERY ERROR:', error)

  return <GalleryClient uploads={uploads ?? []} userId={user?.id ?? ''} />
}