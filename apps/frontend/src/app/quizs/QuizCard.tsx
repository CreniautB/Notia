'use client';

import { Card, CardContent, Typography, Box, Stack, Divider } from '@mui/material';
import { QuizTheme, QuizDifficulty } from '@notia/shared/interfaces/QuizTypes';
import Link from 'next/link';
import { quizThemeConfig, quizDifficultyConfig } from '../../theme/theme';
import { QuizIcon } from '../../components/QuizIcon';

interface QuizCardProps {
  theme: QuizTheme;
  difficulty: QuizDifficulty;
  questionCount: number;
}

export function QuizCard({ theme, difficulty, questionCount }: QuizCardProps) {
  const themeConfig = quizThemeConfig[theme];
  
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
          borderRadius: 3,
          boxShadow: 1,
          overflow: 'hidden',
          borderTop: `3px solid ${themeConfig?.color || '#ccc'}`,
        }}
      >
        <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <QuizIcon theme={theme} size={32} />

              <QuizIcon level={difficulty} size={32} />
            </Stack>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Testez vos connaissances en {themeConfig?.label?.toLowerCase() || theme.toLowerCase()}
          </Typography>
          
          

        </CardContent>
      </Card>
    </Link>
  );
}
