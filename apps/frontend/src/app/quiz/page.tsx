import { Container, Typography, Paper, Box, Chip } from '@mui/material';
import { QuizTheme, QuizDifficulty } from '@notia/shared/interfaces/QuizTypes';
import { notFound, redirect } from 'next/navigation';
import { QuizPlayerWrapper } from './QuizPlayerWrapper';
import { ContentCard } from '../../components/ContentCard';
import type { Metadata } from 'next';
import type { Quiz } from './types';
import { serverApi } from '../../utils/server-api';

// Helper functions for theme and difficulty labels/colors
const getThemeColor = (theme: QuizTheme): string => {
  const themeColors = {
    [QuizTheme.GEOGRAPHY]: '#4CAF50',
    [QuizTheme.HISTORY]: '#FFC107',
    [QuizTheme.SCIENCE]: '#2196F3',
    [QuizTheme.LITERATURE]: '#9C27B0',
    [QuizTheme.ARTS]: '#E91E63',
    [QuizTheme.SPORTS]: '#FF5722',
    [QuizTheme.GENERAL_KNOWLEDGE]: '#607D8B',
  };
  return themeColors[theme] || '#607D8B';
};

const getThemeLabel = (theme: QuizTheme): string => {
  const themeLabels = {
    [QuizTheme.GEOGRAPHY]: 'Géographie',
    [QuizTheme.HISTORY]: 'Histoire',
    [QuizTheme.SCIENCE]: 'Sciences',
    [QuizTheme.LITERATURE]: 'Littérature',
    [QuizTheme.ARTS]: 'Arts',
    [QuizTheme.SPORTS]: 'Sports',
    [QuizTheme.GENERAL_KNOWLEDGE]: 'Culture générale',
  };
  return themeLabels[theme] || theme;
};

const getDifficultyLabel = (difficulty: QuizDifficulty): string => {
  const difficultyLabels = {
    [QuizDifficulty.EASY]: 'Facile',
    [QuizDifficulty.MEDIUM]: 'Moyen',
    [QuizDifficulty.HARD]: 'Difficile',
  };
  return difficultyLabels[difficulty] || difficulty;
};

// Fonction pour obtenir la couleur de la difficulté
const getDifficultyColor = (
  difficulty: QuizDifficulty
): 'success' | 'warning' | 'error' | 'default' => {
  const difficultyColors: Record<QuizDifficulty, 'success' | 'warning' | 'error'> = {
    [QuizDifficulty.EASY]: 'success',
    [QuizDifficulty.MEDIUM]: 'warning',
    [QuizDifficulty.HARD]: 'error',
  };
  return difficultyColors[difficulty] || 'default';
};

async function getRandomQuiz(theme: QuizTheme, difficulty: QuizDifficulty): Promise<Quiz> {
  console.log(
    `Tentative de récupération d'un quiz aléatoire: theme=${theme}, difficulty=${difficulty}`
  );

  try {
    // Utilisation de serverApi au lieu de fetch direct
    const { data, error } = await serverApi.get<Quiz>(
      `/quiz/random?theme=${theme}&difficulty=${difficulty}`,
      {
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(5000),
      },
      0
    );

    // Gestion des erreurs
    if (error) {
      console.error('Erreur API:', error);
      if (error.code === '404') {
        notFound();
      }
      throw new Error(`Erreur lors de la récupération du quiz: ${error.message}`);
    }

    // Validation des données
    if (!data) {
      console.error("Aucune donnée retournée par l'API");
      throw new Error('Le quiz demandé est introuvable');
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du quiz:', error);
    throw error;
  }
}

export const metadata: Metadata = {
  title: 'Quiz en cours',
  description: 'Testez vos connaissances avec ce quiz',
};

export default async function QuizPage(props: {
  searchParams: Promise<{ theme?: string; difficulty?: string }>;
}) {
  const searchParams = await props.searchParams;
  const theme = decodeURIComponent(searchParams.theme || '') as QuizTheme;
  const difficulty = decodeURIComponent(searchParams.difficulty || '') as QuizDifficulty;

  if (!theme || !difficulty) {
    redirect('/quizs');
  }

  try {
    const quiz = await getRandomQuiz(theme, difficulty);

    return (
      <>
        <ContentCard paperProps={{ sx: { p: 3, borderRadius: 3 } }}>
          <QuizPlayerWrapper quiz={quiz} />
        </ContentCard>
        <ContentCard>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Box>
              <Typography variant="h4" align="left">
                {quiz.title}
              </Typography>
              <Typography variant="h5" color="text.secondary">
                {quiz.description}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              <Chip
                label={getThemeLabel(quiz.theme)}
                size="medium"
                sx={{
                  bgcolor: getThemeColor(quiz.theme),
                  color: 'white',
                  p: 3,
                  borderRadius: 3,
                }}
              />
              <Chip
                label={getDifficultyLabel(quiz.difficulty)}
                size="medium"
                color={getDifficultyColor(quiz.difficulty)}
                sx={{
                  p: 3,
                  borderRadius: 3,
                }}
              />
            </Box>
          </Box>
        </ContentCard>
      </>
    );
  } catch (err) {
    console.error('Erreur lors du chargement du quiz:', err);
    redirect('/quizs');
  }
}
