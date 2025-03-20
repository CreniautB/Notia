/**
 * Types pour standardiser les réponses API
 */

// Structure de réponse standard pour toutes les API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// Structure d'erreur standard
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
