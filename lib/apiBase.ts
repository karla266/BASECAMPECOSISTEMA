const DEFAULT_SITE_API_BASE = 'http://127.0.0.1:8001'
const DEFAULT_POS_API_BASE = 'http://127.0.0.1:8000'

export function getSiteApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_API_BASE?.trim()
  if (configured) {
    return configured.replace(/\/$/, '')
  }

  const fallback = process.env.NEXT_PUBLIC_POS_API_BASE?.trim()
  return fallback ? fallback.replace(/\/$/, '') : DEFAULT_SITE_API_BASE
}

export function getPosApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_POS_API_BASE?.trim()
  if (configured) {
    return configured.replace(/\/$/, '')
  }
  return DEFAULT_POS_API_BASE
}

export function siteApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getSiteApiBase()}${normalizedPath}`
}

export function posApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getPosApiBase()}${normalizedPath}`
}
