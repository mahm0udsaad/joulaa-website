const LANGUAGE_KEY = 'preferred_language'

export function getStoredLanguage(): string {
  if (typeof window === 'undefined') return 'en'
  return document.cookie.split('; ').find(row => row.startsWith(`${LANGUAGE_KEY}=`))?.split('=')[1] || 'en'
}

export function setStoredLanguage(lng: string) {
  if (typeof window === 'undefined') return
  document.cookie = `${LANGUAGE_KEY}=${lng}; path=/; max-age=31536000` // 1 year
}

export function switchLanguage(currentLng: string, pathname: string): string {
  const newLng = currentLng === 'en' ? 'ar' : 'en'
  const pathWithoutLang = pathname.replace(`/${currentLng}`, '')
  return `/${newLng}${pathWithoutLang}`
} 