import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import type { Quiz } from '../app/quiz/types';

interface UseGetQuizByIdResult {
  data: Quiz | null;
  isLoading: boolean;
  error: Error | null;
}

export const useGetQuizById = (quizId: string | null): UseGetQuizByIdResult => {
  const [data, setData] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) {
        setIsLoading(false);
        setError(new Error('ID du quiz non spécifié'));
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get<Quiz>(`/quizzes/${quizId}`);
        
        if (response.success && response.data) {
          setData(response.data);
          setError(null);
        } else {
          throw new Error(response.error?.message || 'Erreur lors de la récupération du quiz');
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur lors de la récupération du quiz'));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  return { data, isLoading, error };
}; 