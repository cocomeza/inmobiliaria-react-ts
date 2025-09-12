/**
 * Configuración de la URL base del API
 * En desarrollo: usa rutas relativas (proxy de Vite)
 * En producción: usa rutas relativas (mismo dominio)
 */
export function getApiUrl(): string {
  // Si hay VITE_API_URL definida, usarla (para casos especiales)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Siempre usar rutas relativas para que funcione el proxy
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