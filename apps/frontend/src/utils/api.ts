import { ApiResponse } from '../types/api';

// Configuration par défaut des requêtes
const DEFAULT_CONFIG: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Pour envoyer les cookies avec les requêtes
};

// URL de base de l'API
const API_BASE_URL = '/api';

/**
 * Utilitaire pour effectuer des requêtes HTTP vers l'API
 * Centralise la gestion des erreurs et standardise les réponses
 */
export const api = {
  /**
   * Effectue une requête GET
   * @param endpoint - Le point de terminaison de l'API (sans /api)
   * @param config - Configuration supplémentaire pour fetch
   * @returns Une promesse avec la réponse typée
   */
  async get<T>(endpoint: string, config?: RequestInit): Promise<ApiResponse<T>> {
    return sendRequest<T>(endpoint, {
      ...DEFAULT_CONFIG,
      ...config,
      method: 'GET',
    });
  },

  /**
   * Effectue une requête POST
   * @param endpoint - Le point de terminaison de l'API (sans /api)
   * @param data - Les données à envoyer dans le corps de la requête
   * @param config - Configuration supplémentaire pour fetch
   * @returns Une promesse avec la réponse typée
   */
  async post<T>(endpoint: string, data?: unknown, config?: RequestInit): Promise<ApiResponse<T>> {
    return sendRequest<T>(endpoint, {
      ...DEFAULT_CONFIG,
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * Effectue une requête PUT
   * @param endpoint - Le point de terminaison de l'API (sans /api)
   * @param data - Les données à envoyer dans le corps de la requête
   * @param config - Configuration supplémentaire pour fetch
   * @returns Une promesse avec la réponse typée
   */
  async put<T>(endpoint: string, data?: unknown, config?: RequestInit): Promise<ApiResponse<T>> {
    return sendRequest<T>(endpoint, {
      ...DEFAULT_CONFIG,
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * Effectue une requête DELETE
   * @param endpoint - Le point de terminaison de l'API (sans /api)
   * @param config - Configuration supplémentaire pour fetch
   * @returns Une promesse avec la réponse typée
   */
  async delete<T>(endpoint: string, config?: RequestInit): Promise<ApiResponse<T>> {
    return sendRequest<T>(endpoint, {
      ...DEFAULT_CONFIG,
      ...config,
      method: 'DELETE',
    });
  },
};

/**
 * Fonction interne pour envoyer la requête et gérer les erreurs
 */
async function sendRequest<T>(endpoint: string, config: RequestInit): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, config);

    // Vérifier si la requête a réussi
    if (!response.ok) {
      // Tenter de récupérer les détails de l'erreur depuis le corps de la réponse
      try {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            message: errorData.message || `Erreur ${response.status}: ${response.statusText}`,
            code: errorData.code || String(response.status),
            details: errorData.details,
          },
        };
      } catch {
        // Si on ne peut pas parser le JSON, créer une erreur générique
        return {
          success: false,
          error: {
            message: `Erreur ${response.status}: ${response.statusText}`,
            code: String(response.status),
          },
        };
      }
    }

    // Pour les réponses 204 No Content ou les réponses vides
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true };
    }

    // Parser la réponse JSON
    const data = await response.json();

    // Si le backend utilise déjà notre format ApiResponse
    if (data.hasOwnProperty('success')) {
      return data as ApiResponse<T>;
    }

    // Sinon, envelopper la réponse dans notre format
    return {
      success: true,
      data: data as T,
    };
  } catch (error) {
    // Gérer les erreurs de réseau ou autres erreurs techniques
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Une erreur inattendue est survenue',
        code: 'NETWORK_ERROR',
      },
    };
  }
}
