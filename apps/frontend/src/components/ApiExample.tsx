'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

// Type pour un quiz
interface Quiz {
  id: string;
  title: string;
  description: string;
}

// Exemple de composant qui utilise l'utilitaire API
export default function ApiExample() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les quiz
  const loadQuizzes = async () => {
    setLoading(true);
    setError(null);

    try {
      // Utilisation de notre utilitaire API
      const response = await api.get<Quiz[]>('/quizzes');

      if (response.success && response.data) {
        setQuizzes(response.data);
      } else {
        // Gestion des erreurs retournées par l'API
        setError(response.error?.message || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur lors du chargement des quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les quiz au chargement du composant
  useEffect(() => {
    loadQuizzes();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Liste des Quiz</h2>

      {/* Affichage de l'état de chargement */}
      {loading && <p className="text-gray-500">Chargement en cours...</p>}

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button
            onClick={loadQuizzes}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Liste des quiz */}
      {!loading && !error && quizzes.length === 0 && (
        <p className="text-gray-500">Aucun quiz disponible pour le moment.</p>
      )}

      <ul className="space-y-4">
        {quizzes.map((quiz) => (
          <li key={quiz.id} className="border rounded-lg p-4 shadow-sm">
            <h3 className="text-xl font-semibold">{quiz.title}</h3>
            <p className="text-gray-600">{quiz.description}</p>
            <button
              className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => console.log('Voir quiz:', quiz.id)}
            >
              Voir le quiz
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
