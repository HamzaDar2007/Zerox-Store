import { Helmet } from 'react-helmet-async'
import { APP_NAME } from '@/constants/config'

interface SEOHeadProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
  jsonLd?: Record<string, unknown>
}

export function SEOHead({ title, description, image, url, type = 'website', jsonLd }: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${APP_NAME}` : APP_NAME
  const desc = description || 'Discover amazing deals on electronics, fashion, home & living, and more at ShopVerse.'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {image && <meta name="twitter:image" content={image} />}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  )
}
