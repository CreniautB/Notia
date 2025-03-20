import { Container, Typography, Box } from '@mui/material';
import { QuizTheme, QuizDifficulty } from '@notia/shared/interfaces/QuizTypes';
import { QuizCard } from './QuizCard';
import type { Metadata } from 'next';
import { serverApi } from '../../utils/server-api';

interface QuizAvailability {
  count: number;
  theme: string;
  difficulty: string;
  themeLabel: string;
  difficultyLabel: string;
}

async function getAvailableQuizzes(): Promise<QuizAvailability[]> {
  try {
    // Utilisation de l'API avec destructuration des données et erreurs
    const { data, error } = await serverApi.get<QuizAvailability[]>('/quiz/available', {}, 0);

    // Gestion des erreurs
    if (error) {
      console.error('Erreur API:', error);
      return [];
    }

    // Validation des données
    if (!data || !Array.isArray(data)) {
      console.error('Format de réponse API invalide:', data);
      return [];
    }

    // Ne retourner que les quiz qui ont au moins 10 questions
    return data.filter((quiz) => quiz.count >= 10);
  } catch (e) {
    // Capture toute erreur non gérée
    console.error('Erreur inattendue lors de la récupération des quiz:', e);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Catégories de Quiz',
  description: 'Choisissez une catégorie de quiz pour tester vos connaissances',
};

export default async function QuizCategoriesPage() {
  const availableQuizzes = await getAvailableQuizzes();

  if (availableQuizzes.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Aucun quiz disponible
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary">
          Désolé, aucun quiz n&apos;est disponible pour le moment. Veuillez réessayer plus tard.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Choisissez votre Quiz
      </Typography>
      <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
        Sélectionnez une catégorie et une difficulté pour commencer
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Catégories disponibles
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {availableQuizzes.map((quiz) => (
            <QuizCard
              key={`${quiz.theme}-${quiz.difficulty}`}
              theme={quiz.theme as QuizTheme}
              difficulty={quiz.difficulty as QuizDifficulty}
              questionCount={quiz.count}
            />
          ))}
        </Box>
      </Box>
    </Container>
  );
}
