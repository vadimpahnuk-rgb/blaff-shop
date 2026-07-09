import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'BLA SHOP'
const DEFAULT_DESCRIPTION =
  'Цифрові товари для медіабаєрів: акаунти Facebook, Business Manager, проксі та інструменти. Швидко, надійно, цілодобово.'
const DEFAULT_IMAGE = 'https://pwa-x.com/og-image.png'
const SITE_URL = 'https://pwa-x.com'

interface SEOProps {
  title?: string
  description?: string
  path?: string
  image?: string
  noindex?: boolean
}

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  image = DEFAULT_IMAGE,
  noindex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Цифрові товари для медіабаєрів`
  const url = `${SITE_URL}${path}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  )
}
