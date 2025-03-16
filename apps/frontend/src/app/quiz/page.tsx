import { Container, Typography, Paper, Box, Chip } from '@mui/material';
import { QuizTheme, QuizDifficulty } from '@notia/shared/interfaces/QuizTypes';
import { notFound, redirect } from 'next/navigation';
import { QuizPlayerWrapper } from './QuizPlayerWrapper';
import type { Metadata } from 'next';
import type { Quiz } from './types';

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
  try {
    const apiUrl = `http://localhost:3001/api/quiz/random?theme=${theme}&difficulty=${difficulty}`;
    console.log(`Tentative de connexion à l'API: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(5000),
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Erreur API: ${response.status} - ${await response.text()}`);
      if (response.status === 404) {
        notFound();
      }
      throw new Error(`Erreur lors de la récupération du quiz: ${response.status}`);
    }

    const data = await response.json();
    return data as Quiz;
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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 1, mb: 3 }}>
          <Typography variant="h4" align="center">
            {quiz.title}
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 3 }}>
            {quiz.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Chip
              label={getThemeLabel(quiz.theme)}
              size="small"
              sx={{
                bgcolor: getThemeColor(quiz.theme),
                color: 'white',
                mr: 1,
              }}
            />
            <Chip
              label={getDifficultyLabel(quiz.difficulty)}
              size="small"
              color={getDifficultyColor(quiz.difficulty)}
            />
          </Box>
          <QuizPlayerWrapper quiz={quiz} />
        </Paper>
      </Container>
    );
  } catch (err) {
    console.error('Erreur lors du chargement du quiz:', err);
    redirect('/quizs');
  }
}
