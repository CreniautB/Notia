'use client';

import { Typography, Box, Stack } from '@mui/material';
import { QuizPlayerWrapper } from './QuizPlayerWrapper';
import type { Quiz } from './types';
import { DIFFICULTY_LABELS } from './utils';
import { QuizDifficulty } from '@notia/shared/interfaces/QuizTypes';
import { ContentCard } from '../../components/ContentCard';
import { QuizIcon } from '../../components/QuizIcon';

interface QuizClientProps {
  quiz: Quiz;
}

export function QuizClient({ quiz }: QuizClientProps) {
  return (
      <>
      <QuizPlayerWrapper quiz={quiz} />

      <ContentCard>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4">{quiz.title}</Typography>
            <Typography variant="subtitle1">
              {`${quiz.questions.length} questions • ${DIFFICULTY_LABELS[quiz.difficulty as QuizDifficulty]}`}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <QuizIcon theme={quiz.theme} size={32} />
            <QuizIcon level={quiz.difficulty} size={32} />
          </Stack>
        </Box>
      </ContentCard>
      </>
  );
} 