import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://unisearch.com'
  
  // Static routes
  const routes = [
    '',
    '/schools',
    '/login',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }))

  // Dynamic routes (Schools)
  const supabase = await createClient()
  const { data: schools } = await supabase
    .from('institutions')
    .select('institution_id')
    // Fetching a subset to ensure performance, in production you might want to paginate or include all
    .limit(1000) 

  const schoolRoutes = schools?.map((school) => ({
    url: `${baseUrl}/schools/${school.institution_id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || []

  return [...routes, ...schoolRoutes]
}
