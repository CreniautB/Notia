'use client';

import { Card, CardContent, Typography, Box, useTheme, alpha } from '@mui/material';
import { QuizTheme, QuizDifficulty } from '@notia/shared/interfaces/QuizTypes';
import Link from 'next/link';
import { quizThemeConfig } from '../../theme/theme';
import { QuizIcon } from '../../components/QuizIcon';
import { QuizDifficultyIndicator } from '../../components/QuizDifficultyIndicator';

interface QuizCardProps {
  theme: QuizTheme;
  difficulty: QuizDifficulty;
  questionCount: number;
}

export function QuizCard({ theme, difficulty, questionCount }: QuizCardProps) {
  const muiTheme = useTheme();
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

        }}
      >

        <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <QuizIcon theme={theme} size={32} />
            <Typography variant="h6" component="h3">
              {themeConfig?.label || theme}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Testez vos connaissances en {themeConfig?.label?.toLowerCase() || theme.toLowerCase()}
          </Typography>
          
          <Box sx={{ 
            mt: 'auto', 
            pt: 2, 
            display: 'flex', 
            flexWrap: 'wrap', 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <QuizDifficultyIndicator difficulty={difficulty} size={10} />
            
            <Typography
              variant="smallBold"
              sx={{
                backgroundColor: alpha(muiTheme.palette.primary.main, 0.1),
                color: muiTheme.palette.primary.main,
                borderRadius: 1,
                px: 1.5,
                py: 0.5,
              }}
            >
              {questionCount} questions
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}
