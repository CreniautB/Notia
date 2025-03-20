/**
 * Interface pour standardiser les réponses API
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * Interface pour standardiser les erreurs API
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
