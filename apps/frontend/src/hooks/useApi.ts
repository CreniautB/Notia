'use client';

import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { ApiError } from '../types/api';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour gérer les appels API avec les états de chargement, d'erreur et de données
 * @param endpoint - Le point de terminaison de l'API (sans /api)
 * @param options - Les options pour le hook
 * @returns Un objet contenant les données, l'état de chargement, les erreurs et une fonction pour rafraîchir les données
 */
export function useApiGet<T>(
  endpoint: string,
  options?: {
    skip?: boolean;
    initialData?: T | null;
    config?: RequestInit;
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
  }
): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: options?.initialData || null,
    loading: !options?.skip,
    error: null,
    refetch: async () => {
      // Cette fonction sera remplacée dans useEffect
    },
  });

  const fetchData = async () => {
    if (options?.skip) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await api.get<T>(endpoint, options?.config);

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          refetch: fetchData,
        });
        options?.onSuccess?.(response.data);
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || {
            message: 'Une erreur est survenue',
            code: 'UNKNOWN_ERROR',
          },
          refetch: fetchData,
        });
        options?.onError?.(
          response.error || {
            message: 'Une erreur est survenue',
            code: 'UNKNOWN_ERROR',
          }
        );
      }
    } catch (err) {
      const error: ApiError = {
        message: err instanceof Error ? err.message : 'Une erreur inattendue est survenue',
        code: 'NETWORK_ERROR',
      };

      setState({
        data: null,
        loading: false,
        error,
        refetch: fetchData,
      });

      options?.onError?.(error);
    }
  };

  useEffect(() => {
    setState((prev) => ({ ...prev, refetch: fetchData }));
    fetchData();
  }, [endpoint]);

  return state;
}

/**
 * Hook pour effectuer une mutation (POST, PUT, DELETE) API
 * @returns Un objet contenant la fonction de mutation, l'état de chargement et les erreurs
 */
export function useApiMutation<T, D = unknown>(options?: {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}) {
  const [state, setState] = useState<{
    loading: boolean;
    error: ApiError | null;
    data: T | null;
  }>({
    loading: false,
    error: null,
    data: null,
  });

  const mutate = async (
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE',
    data?: D,
    config?: RequestInit
  ) => {
    setState({ loading: true, error: null, data: null });

    try {
      const apiMethod =
        method === 'POST' ? api.post<T> : method === 'PUT' ? api.put<T> : api.delete<T>;

      const response = await apiMethod(endpoint, data, config);

      if (response.success && response.data) {
        setState({
          loading: false,
          error: null,
          data: response.data,
        });
        options?.onSuccess?.(response.data);
        return response.data;
      } else {
        setState({
          loading: false,
          error: response.error || {
            message: 'Une erreur est survenue',
            code: 'UNKNOWN_ERROR',
          },
          data: null,
        });
        options?.onError?.(
          response.error || {
            message: 'Une erreur est survenue',
            code: 'UNKNOWN_ERROR',
          }
        );
        return null;
      }
    } catch (err) {
      const error: ApiError = {
        message: err instanceof Error ? err.message : 'Une erreur inattendue est survenue',
        code: 'NETWORK_ERROR',
      };

      setState({
        loading: false,
        error,
        data: null,
      });

      options?.onError?.(error);
      return null;
    }
  };

  return {
    mutate,
    ...state,
  };
}
