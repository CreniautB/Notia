'use client';

import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { QuizTheme, QuizDifficulty } from '@notia/shared/interfaces/QuizTypes';
import Link from 'next/link';

interface QuizCardProps {
  theme: QuizTheme;
  difficulty: QuizDifficulty;
  questionCount: number;
}

const themeColors: Record<QuizTheme, string> = {
  [QuizTheme.GEOGRAPHY]: '#4CAF50',
  [QuizTheme.HISTORY]: '#FFC107',
  [QuizTheme.SCIENCE]: '#2196F3',
  [QuizTheme.LITERATURE]: '#9C27B0',
  [QuizTheme.ARTS]: '#E91E63',
  [QuizTheme.SPORTS]: '#FF5722',
  [QuizTheme.GENERAL_KNOWLEDGE]: '#607D8B',
};

const themeLabels: Record<QuizTheme, string> = {
  [QuizTheme.GEOGRAPHY]: 'Géographie',
  [QuizTheme.HISTORY]: 'Histoire',
  [QuizTheme.SCIENCE]: 'Sciences',
  [QuizTheme.LITERATURE]: 'Littérature',
  [QuizTheme.ARTS]: 'Arts',
  [QuizTheme.SPORTS]: 'Sports',
  [QuizTheme.GENERAL_KNOWLEDGE]: 'Culture générale',
};

const difficultyColors: Record<QuizDifficulty, string> = {
  [QuizDifficulty.EASY]: '#4CAF50',
  [QuizDifficulty.MEDIUM]: '#FFC107',
  [QuizDifficulty.HARD]: '#f44336',
};

const difficultyLabels: Record<QuizDifficulty, string> = {
  [QuizDifficulty.EASY]: 'Facile',
  [QuizDifficulty.MEDIUM]: 'Moyen',
  [QuizDifficulty.HARD]: 'Difficile',
};

export function QuizCard({ theme, difficulty, questionCount }: QuizCardProps) {
  return (
    <Link
      href={`/quiz?theme=${encodeURIComponent(theme)}&difficulty=${encodeURIComponent(difficulty)}`}
      style={{ textDecoration: 'none' }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
        }}
      >
        <CardContent>
          <Typography
            gutterBottom
            variant="h6"
            component="h3"
            sx={{ color: themeColors[theme], mt: 1 }}
          >
            {themeLabels[theme]}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Testez vos connaissances en {themeLabels[theme].toLowerCase()}
          </Typography>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}
          >
            <Typography
              variant="caption"
              sx={{
                color: difficultyColors[difficulty],
                fontWeight: 'bold',
              }}
            >
              Niveau : {difficultyLabels[difficulty]}
            </Typography>
            <Chip
              label={`${questionCount} questions`}
              size="small"
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                fontWeight: 'medium',
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}
