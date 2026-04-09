const TOKEN_KEY = 'melt_token'

export interface JwtPayload {
  sub: string
  email: string
  isGuest: boolean
  iat?: number
  exp?: number
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function decodeToken(token: string | null): JwtPayload | null {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export function getUser(): JwtPayload | null {
  return decodeToken(getToken())
}

export function isLoggedIn(): boolean {
  const token = getToken()
  if (!token) return false
  const user = decodeToken(token)
  if (!user) return false
  // Check expiry
  if (user.exp && user.exp * 1000 < Date.now()) {
    clearToken()
    return false
  }
  return true
}
