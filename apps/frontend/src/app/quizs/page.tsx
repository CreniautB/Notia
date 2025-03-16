import { Container, Typography, Box } from '@mui/material';
import { QuizTheme, QuizDifficulty } from '@notia/shared/interfaces/QuizTypes';
import { QuizCard } from './QuizCard';
import type { Metadata } from 'next';

interface QuizAvailability {
  count: number;
  theme: string;
  difficulty: string;
  themeLabel: string;
  difficultyLabel: string;
}

async function getAvailableQuizzes(): Promise<QuizAvailability[]> {
  try {
    const response = await fetch('http://localhost:3001/api/quiz/available', {
      next: { revalidate: 0 },
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Erreur API: ${response.status} - ${await response.text()}`);
      throw new Error(`Erreur lors de la récupération des quiz disponibles: ${response.status}`);
    }

    const apiResponse = (await response.json()) as QuizAvailability[];

    if (!Array.isArray(apiResponse)) {
      console.error('Format de réponse API invalide:', apiResponse);
      throw new Error('Format de réponse API invalide');
    }

    // Ne retourner que les quiz qui ont au moins 10 questions
    return apiResponse.filter((quiz) => quiz.count >= 10);
  } catch (error) {
    console.error('Erreur lors de la récupération des quiz disponibles:', error);
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
