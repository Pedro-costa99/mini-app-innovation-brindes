export const TOKEN_KEY = "access_token";

function setCookieToken(token: string | null) {
  if (typeof document === "undefined") return;
  if (token) {
    document.cookie = `auth_token=${token}; path=/; SameSite=Lax`;
  } else {
    document.cookie =
      "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const sessionTok = sessionStorage.getItem(TOKEN_KEY);
  if (sessionTok) return sessionTok;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, remember: boolean) {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
  setCookieToken(token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  setCookieToken(null);
}
