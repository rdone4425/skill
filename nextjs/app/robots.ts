import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_headers'],
    },
    sitemap: 'https://skill.442595.xyz/sitemap.xml',
  }
}