// Utility functions for storing and retrieving JWT token

export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jwt_token', token);
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('jwt_token');
  }
  return null;
}

export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt_token');
  }
}
