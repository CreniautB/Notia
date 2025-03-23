'use client';

import { Box, Tooltip, SxProps, Theme } from '@mui/material';
import { QuizTheme } from '@notia/shared/interfaces/QuizTypes';
import { quizThemeConfig } from '../theme/theme';

// Import des icônes Material UI
import PublicIcon from '@mui/icons-material/Public';
import HistoryIcon from '@mui/icons-material/History';
import ScienceIcon from '@mui/icons-material/Science';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PaletteIcon from '@mui/icons-material/Palette';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PsychologyIcon from '@mui/icons-material/Psychology';

// Définir les types d'icônes valides
type IconName = 'public' | 'history' | 'science' | 'menu_book' | 'palette' | 'sports_soccer' | 'psychology';

// Map de correspondance entre les noms d'icônes et les composants d'icônes
const iconComponents: Record<IconName, React.ComponentType<any>> = {
  'public': PublicIcon,
  'history': HistoryIcon,
  'science': ScienceIcon,
  'menu_book': MenuBookIcon,
  'palette': PaletteIcon,
  'sports_soccer': SportsSoccerIcon,
  'psychology': PsychologyIcon,
};

interface QuizIconProps {
  theme: QuizTheme;
  size?: number; // taille en pixels
  withTooltip?: boolean;
  sx?: SxProps<Theme>;
}

export function QuizIcon({ theme, size = 40, withTooltip = true, sx = {} }: QuizIconProps) {
  const config = quizThemeConfig[theme];
  
  if (!config) {
    return null;
  }

  const iconSize = size * 0.6; // L'icône prend 60% de la taille du cercle
  const IconComponent = iconComponents[config.icon as IconName];
  
  if (!IconComponent) {
    return null;
  }
  
  const content = (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: config.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        boxShadow: 3,
        ...sx,
      }}

    >
      <IconComponent
        sx={{
          color: '#ffffff',
          fontSize: iconSize,
        }}
      />
    </Box>
  );

  return withTooltip ? (
    <Tooltip title={config.label} placement="top">
      {content}
    </Tooltip>
  ) : (
    content
  );
} 