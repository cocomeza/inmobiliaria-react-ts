/**
 * Configuración de la URL base del API
 * En desarrollo: usa localhost:4000
 * En producción: usa rutas relativas (mismo dominio)
 */
export function getApiUrl(): string {
  // Si hay VITE_API_URL definida, usarla (para casos especiales)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // En desarrollo (modo dev), usar localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:4000'
  }
  
  // En producción, usar rutas relativas (mismo dominio)
  return ''
}

/**
 * Helper para hacer requests al API con la URL correcta
 */
export async function apiRequest(endpoint: string, options?: RequestInit) {
  const baseUrl = getApiUrl()
  const url = `${baseUrl}${endpoint}`
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  })
}