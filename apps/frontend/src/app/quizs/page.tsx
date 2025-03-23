import { Typography, Box } from '@mui/material';
import { QuizTheme, QuizDifficulty } from '@notia/shared/interfaces/QuizTypes';
import { QuizCard } from './QuizCard';
import type { Metadata } from 'next';
import { serverApi } from '../../utils/server-api';
import { ContentCard } from '../../components/ContentCard';

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
      <ContentCard paperProps={{ sx: { p: 3, borderRadius: 3 } }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Aucun quiz disponible
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Désolé, aucun quiz n&apos;est disponible pour le moment. Veuillez réessayer plus tard.
          </Typography>
        </Box>
      </ContentCard>
    );
  }



  return (
    <>
      <ContentCard paperProps={{ sx: { p: 3, borderRadius: 3 } }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Choisissez votre Quiz
          </Typography>
          <Typography variant="h6" component="h2" gutterBottom color="text.secondary" sx={{ mb: 4 }}>
            Sélectionnez une catégorie et une difficulté pour commencer
          </Typography>
          

        </Box>


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
      </ContentCard>
    </>
  );
}
