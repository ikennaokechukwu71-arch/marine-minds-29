] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('anonymous_messages').select('*', { count: 'exact', head: true }).eq('is_approved', true),
    supabase.from('gallery_uploads').select('*', { count: 'exact', head: true }).eq('is_approved', true),
    supabase
      .from('students')
      .select('id, full_name, nickname, avatar_url, likes_count, mentions_count')
      .order('likes_count', { ascending: false })
      .limit(5) as unknown as Promise<{ data: { id: string; full_name: string; nickname: string | null; avatar_url: string | null; likes_count: number; mentions_count: number }[] | null }>,
    supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3) as unknown as Promise<{ data: { id: string; title: string; content: string; created_at: string }[] | null }>,
    supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(3) as unknown as Promise<{ data: { id: string; title: string; event_date: string; location: string | null }[] | null }>,
    supabase
      .from('students')
      .select('full_name, nickname, birthday')
      .not('birthday', 'is', null) as unknown as Promise<{ data: { full_name: string; nickname: string | null; birthday: string }[] | null }>,
  ]) as unknown as [
    { count: number | null },
    { count: number | null },
    { count: number | null },
    { data: { id: string; full_name: string; nickname: string | null; avatar_url: string | null; likes_count: number; mentions_count: number }[] | null },
    { data: { id: string; title: string; content: string; created_at: string }[] | null },
    { data: { id: string; title: string; event_date: string; location: string | null }[] | null },
    { data: { full_name: string; nickname: string | null; birthday: string }[] | null },
  ]