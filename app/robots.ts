import { MetadataRoute } from 'next'
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login', '/admin/', '/api/', '/dashboard/', '/superadmin/', '/order/', '/menu/', '/app/'],
    },
    sitemap: 'https://tableboost.app/sitemap.xml',
  }
}
