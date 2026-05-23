const REMEMBER_KEY = 'papercraft_remember_login'
const LOGIN_ID_KEY = 'papercraft_saved_login_id'

export type LoginPreferences = {
  remember: boolean
  loginId: string
}

export function loadLoginPreferences(): LoginPreferences {
  try {
    const remember = localStorage.getItem(REMEMBER_KEY) === '1'
    const loginId = remember
      ? (localStorage.getItem(LOGIN_ID_KEY)?.trim() ?? '')
      : ''
    return { remember, loginId }
  } catch {
    return { remember: true, loginId: '' }
  }
}

/** Persist login ID for the sign-in form (not the password). Survives logout. */
export function saveLoginPreferences(loginId: string, remember: boolean): void {
  try {
    localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0')
    if (remember && loginId.trim()) {
      localStorage.setItem(LOGIN_ID_KEY, loginId.trim().toLowerCase())
    } else {
      localStorage.removeItem(LOGIN_ID_KEY)
    }
  } catch {
    /* private mode / quota */
  }
}
