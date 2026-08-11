import { MetadataRoute } from 'next'
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/dashboard/', '/superadmin/', '/order/', '/menu/'],
    },
    sitemap: 'https://tableboost.app/sitemap.xml',
  }
}
