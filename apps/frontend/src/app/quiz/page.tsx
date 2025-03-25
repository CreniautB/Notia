import { Box, Container } from '@mui/material';
import { QuizTheme, QuizDifficulty } from '@notia/shared/interfaces/QuizTypes';
import type { Metadata } from 'next';
import { QuizClient } from './QuizClient';
import { notFound, redirect } from 'next/navigation';
import { serverApi } from '../../utils/server-api';
import type { Quiz } from './types';


export const metadata: Metadata = {
  title: 'Quiz en cours',
  description: 'Testez vos connaissances avec ce quiz',
};

async function getRandomQuiz(theme: QuizTheme, difficulty: QuizDifficulty): Promise<Quiz> {
  try {
    const { data, error } = await serverApi.get<Quiz>(
      `/quiz/random?theme=${theme}&difficulty=${difficulty}`,
      {
        next: { revalidate: 0 },
      }
    );

    if (error) {
      console.error('Erreur API:', error);
      if (error.code === '404') {
        notFound();
      }
      throw new Error(`Erreur lors de la récupération du quiz: ${error.message}`);
    }

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

interface PageProps {
  searchParams: {
    theme?: string;
    difficulty?: string;
  };
}

export default async function QuizPage({ searchParams }: PageProps) {
  const { theme, difficulty } = searchParams;

  // Vérifier si les paramètres sont présents et valides
  if (!theme || !difficulty) {
    redirect('/quizs');
  }

  // Vérifier si les valeurs sont des valeurs valides des enums
  if (!Object.values(QuizTheme).includes(theme as QuizTheme) || 
      !Object.values(QuizDifficulty).includes(difficulty as QuizDifficulty)) {
    redirect('/quizs');
  }

  try {
    const quiz = await getRandomQuiz(theme as QuizTheme, difficulty as QuizDifficulty);

    return (
      <Container maxWidth="lg" >
        <Box sx={{ overflow: 'hidden' }}>
          <QuizClient quiz={quiz} />
        </Box>
      </Container>
    );
  } catch (error) {
    redirect('/quizs');
  }
}
