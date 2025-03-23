'use client';

import { Box, Tooltip, Typography, SxProps, Theme } from '@mui/material';
import { QuizDifficulty } from '@notia/shared/interfaces/QuizTypes';
import { useState } from 'react';
import { quizDifficultyConfig } from '../theme/theme';

interface QuizDifficultyIndicatorProps {
  difficulty: QuizDifficulty;
  size?: number; 
  withTooltip?: boolean;
  withLabel?: boolean;
  sx?: SxProps<Theme>;
}

export function QuizDifficultyIndicator({ 
  difficulty, 
  size = 10, 
  withTooltip = true, 
  withLabel = true,
  sx = {} 
}: QuizDifficultyIndicatorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = quizDifficultyConfig[difficulty];
  
  if (!config) {
    return null;
  }
  
  const content = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: size / 2,
        transition: 'transform 0.2s ease-in-out',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        ...sx,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {Array(config.dots).fill(0).map((_, index) => (
        <Box
          key={index}
          sx={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: config.color,
            boxShadow: isHovered ? 2 : 1,
          }}
        />
      ))}
      
      {withLabel && (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ ml: 1, fontWeight: isHovered ? 'medium' : 'regular' }}
        >
          {config.label}
        </Typography>
      )}
    </Box>
  );

  return withTooltip && !withLabel ? (
    <Tooltip title={config.label} placement="top">
      {content}
    </Tooltip>
  ) : (
    content
  );
} 