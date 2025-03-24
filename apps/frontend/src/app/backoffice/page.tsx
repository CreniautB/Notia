'use client';

import { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import { useRouter } from 'next/navigation';
import { serverApi } from '../../utils/server-api';
import { ApiResponse } from '../../types/api';

// Composants
import {
  QuestionFilters,
  QuestionsTable,
  BackofficeHeader,
  AddQuestionButton,
  LoadingState
} from './components';

// Types
import { Question } from './components/QuestionsTable';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  isAdmin: boolean;
}

interface AuthStatus {
  isAuthenticated: boolean;
  user: User | null;
}

export default function BackofficePage() {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [themeFilter, setThemeFilter] = useState('TOUS');
  const [difficultyFilter, setDifficultyFilter] = useState('TOUS');
  const router = useRouter();

  // Charger les questions depuis l'API
  const loadQuestions = async () => {
    try {
      const questionsResponse = await serverApi.get<ApiResponse<Question[]>>('/questions');
      if (questionsResponse.data && questionsResponse.data.data) {
        setQuestions(questionsResponse.data.data);
        applyFilters(questionsResponse.data.data, themeFilter, difficultyFilter);
      } else {
        setQuestions([]);
        setFilteredQuestions([]);
        console.error('Aucune donnée reçue de l\'API questions');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
    }
  };

  // Appliquer les filtres au tableau des questions
  const applyFilters = (questionsList: Question[], theme: string, difficulty: string) => {
    let filtered = [...questionsList];
    
    if (theme !== 'TOUS') {
      filtered = filtered.filter(q => q.theme === theme);
    }
    
    if (difficulty !== 'TOUS') {
      filtered = filtered.filter(q => q.difficulty === difficulty);
    }
    
    setFilteredQuestions(filtered);
  };

  // Vérifier l'état d'authentification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResponse = await serverApi.get<AuthStatus>('/auth/status');
        const authData = authResponse.data;
        
        setAuthStatus(authData);
        
        // Si l'utilisateur n'est pas authentifié, rediriger vers la page de login
        if (!authData?.isAuthenticated || !authData?.user?.isAdmin) {
          router.push('/login');
          return;
        }
        
        // Charger les questions
        await loadQuestions();
      } catch (err) {
        setError('Erreur lors de la vérification de l\'authentification');
        // En cas d'erreur, rediriger vers la page de login
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Filtrer les questions quand les filtres changent
  useEffect(() => {
    applyFilters(questions, themeFilter, difficultyFilter);
  }, [themeFilter, difficultyFilter, questions]);

  // Gestionnaires de changement de filtres
  const handleThemeChange = (theme: string) => {
    setThemeFilter(theme);
  };

  const handleDifficultyChange = (difficulty: string) => {
    setDifficultyFilter(difficulty);
  };

  // Gestionnaire pour l'ajout d'une question
  const handleAddQuestion = () => {
    router.push('/backoffice/add-question');
  };

  if (loading) {
    return <LoadingState />;
  }

  // Si l'authentification n'est pas confirmée, afficher un message de chargement
  // La redirection sera gérée par le useEffect
  if (!authStatus?.isAuthenticated || !authStatus?.user?.isAdmin) {
    return <LoadingState />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <BackofficeHeader user={authStatus.user} apiUrl={API_URL} />
      
      <QuestionFilters
        themeFilter={themeFilter}
        difficultyFilter={difficultyFilter}
        onThemeChange={handleThemeChange}
        onDifficultyChange={handleDifficultyChange}
      />
      
      <QuestionsTable
        questions={filteredQuestions}
        onQuestionUpdated={loadQuestions}
      />
      
      <AddQuestionButton onClick={handleAddQuestion} />
    </Container>
  );
} 