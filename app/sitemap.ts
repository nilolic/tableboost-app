import { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://tableboost.app/',
      lastModified: new Date('2026-08-30'),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
