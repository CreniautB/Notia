import { ApiResponse, ApiError } from '../types/api';

// Types pour les résultats des appels API
export interface ApiResult<T> {
  data: T | null;
  error: ApiError | null;
}

// URL complète de l'API pour les appels côté serveur
const API_BASE_URL = 'http://localhost:3001/api';

// Configuration par défaut des requêtes
const DEFAULT_CONFIG: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  credentials: 'include', // Important pour envoyer les cookies d'authentification
  mode: 'cors',
};

/**
 * Utilitaire pour effectuer des requêtes HTTP vers l'API depuis les composants serveur
 * Centralise la gestion des erreurs et standardise les réponses
 */
export const serverApi = {
  /**
   * Effectue une requête GET et retourne directement les données et les erreurs
   * @param endpoint - Le point de terminaison de l'API (sans /api)
   * @param config - Configuration supplémentaire pour fetch
   * @param revalidate - Option Next.js pour contrôler la revalidation des données
   * @returns Un objet contenant les données et les erreurs
   */
  async get<T>(endpoint: string, config?: RequestInit, revalidate?: number): Promise<ApiResult<T>> {
    try {
      console.log("Envoi requête GET vers", API_BASE_URL + endpoint, "avec credentials inclus");
      const response = await sendRequest<T>(endpoint, {
        ...DEFAULT_CONFIG,
        ...config,
        method: 'GET',
        credentials: 'include', // S'assurer que les credentials sont inclus
        next: revalidate !== undefined ? { revalidate } : undefined,
      });

      console.log("Réponse reçue:", response);
      
      if (response.success && response.data) {
        return { data: response.data, error: null };
      } else {
        return {
          data: null,
          error: response.error || { message: 'Erreur inconnue', code: 'UNKNOWN' },
        };
      }
    } catch (error) {
      console.error("Erreur complète lors de la requête:", error);
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Une erreur inattendue est survenue',
        code: 'NETWORK_ERROR',
      };
      return { data: null, error: apiError };
    }
  },

  /**
   * Effectue une requête POST et retourne directement les données et les erreurs
   * @param endpoint - Le point de terminaison de l'API (sans /api)
   * @param data - Les données à envoyer dans le corps de la requête
   * @param config - Configuration supplémentaire pour fetch
   * @returns Un objet contenant les données et les erreurs
   */
  async post<T>(endpoint: string, data?: unknown, config?: RequestInit): Promise<ApiResult<T>> {
    try {
      const response = await sendRequest<T>(endpoint, {
        ...DEFAULT_CONFIG,
        ...config,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });

      if (response.success && response.data) {
        return { data: response.data, error: null };
      } else {
        return {
          data: null,
          error: response.error || { message: 'Erreur inconnue', code: 'UNKNOWN' },
        };
      }
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Une erreur inattendue est survenue',
        code: 'NETWORK_ERROR',
      };
      return { data: null, error: apiError };
    }
  },

  /**
   * Effectue une requête PUT et retourne directement les données et les erreurs
   * @param endpoint - Le point de terminaison de l'API (sans /api)
   * @param data - Les données à envoyer dans le corps de la requête
   * @param config - Configuration supplémentaire pour fetch
   * @returns Un objet contenant les données et les erreurs
   */
  async put<T>(endpoint: string, data?: unknown, config?: RequestInit): Promise<ApiResult<T>> {
    try {
      const response = await sendRequest<T>(endpoint, {
        ...DEFAULT_CONFIG,
        ...config,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });

      if (response.success && response.data) {
        return { data: response.data, error: null };
      } else {
        return {
          data: null,
          error: response.error || { message: 'Erreur inconnue', code: 'UNKNOWN' },
        };
      }
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Une erreur inattendue est survenue',
        code: 'NETWORK_ERROR',
      };
      return { data: null, error: apiError };
    }
  },

  /**
   * Effectue une requête DELETE et retourne directement les données et les erreurs
   * @param endpoint - Le point de terminaison de l'API (sans /api)
   * @param config - Configuration supplémentaire pour fetch
   * @returns Un objet contenant les données et les erreurs
   */
  async delete<T>(endpoint: string, config?: RequestInit): Promise<ApiResult<T>> {
    try {
      const response = await sendRequest<T>(endpoint, {
        ...DEFAULT_CONFIG,
        ...config,
        method: 'DELETE',
      });

      if (response.success && response.data) {
        return { data: response.data, error: null };
      } else {
        return {
          data: null,
          error: response.error || { message: 'Erreur inconnue', code: 'UNKNOWN' },
        };
      }
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Une erreur inattendue est survenue',
        code: 'NETWORK_ERROR',
      };
      return { data: null, error: apiError };
    }
  },

  // Version originale pour compatibilité
  _get: sendRequest,
  _post: sendRequest,
  _put: sendRequest,
  _delete: sendRequest,
};

/**
 * Fonction interne pour envoyer la requête et gérer les erreurs
 */
async function sendRequest<T>(endpoint: string, config: RequestInit): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    // Ajouter le token JWT depuis localStorage à l'en-tête Authorization si disponible
    let headers = { ...config.headers };
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers = {
          ...headers,
          'Authorization': `Bearer ${token}`
        };
      }
    }
    
    const response = await fetch(url, {
      ...config,
      headers
    });

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
    console.error('Erreur API serveur:', error);

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Une erreur inattendue est survenue',
        code: 'NETWORK_ERROR',
      },
    };
  }
}
