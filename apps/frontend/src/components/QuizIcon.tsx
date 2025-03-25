'use client';

import { Box, Tooltip, SxProps, Theme } from '@mui/material';
import { QuizTheme, QuizDifficulty } from '@notia/shared/interfaces/QuizTypes';
import { quizThemeConfig, quizDifficultyConfig } from '../theme/theme';

// Import des icônes Material UI
import PublicIcon from '@mui/icons-material/Public';
import HistoryIcon from '@mui/icons-material/AccountBalance';
import ScienceIcon from '@mui/icons-material/Science';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PaletteIcon from '@mui/icons-material/Palette';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PsychologyIcon from '@mui/icons-material/Psychology';
import Filter1Icon from '@mui/icons-material/Filter1';
import Filter2Icon from '@mui/icons-material/Filter2';
import Filter3Icon from '@mui/icons-material/Filter3';

// Définir les types d'icônes valides
type IconName = 'public' | 'history' | 'science' | 'menu_book' | 'palette' | 'sports_soccer' | 'psychology' | 'filter1' | 'filter2' | 'filter3';

// Map de correspondance entre les noms d'icônes et les composants d'icônes
const iconComponents: Record<IconName, React.ComponentType<any>> = {
  'public': PublicIcon,
  'history': HistoryIcon,
  'science': ScienceIcon,
  'menu_book': MenuBookIcon,
  'palette': PaletteIcon,
  'sports_soccer': SportsSoccerIcon,
  'psychology': PsychologyIcon,
  'filter1': Filter1Icon,
  'filter2': Filter2Icon,
  'filter3': Filter3Icon,
};

// Map pour les icônes de difficulté
const difficultyIconMap = {
  [QuizDifficulty.EASY]: 'filter1',
  [QuizDifficulty.MEDIUM]: 'filter2',
  [QuizDifficulty.HARD]: 'filter3',
};

interface QuizIconProps {
  theme?: QuizTheme;
  level?: QuizDifficulty;
  size?: number;
  withTooltip?: boolean;
  sx?: SxProps<Theme>;
}

export function QuizIcon({ theme, level, size = 40, withTooltip = true, sx = {} }: QuizIconProps) {
  // Déterminer quel type d'icône afficher
  let config, iconName, tooltipText;
  
  if (level) {
    // Afficher une icône de difficulté
    config = quizDifficultyConfig[level];
    iconName = difficultyIconMap[level] as IconName;
    tooltipText = `Difficulté: ${config?.label}`;
  } else if (theme) {
    // Afficher une icône de thème
    config = quizThemeConfig[theme];
    iconName = config?.icon as IconName;
    tooltipText = config?.label;
  } else {
    return null; // Ni thème ni niveau spécifié
  }

  if (!config || !iconName) {
    return null;
  }

  const iconSize = size * 0.6;
  const IconComponent = iconComponents[iconName];
  
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
    <Tooltip title={tooltipText} placement="top">
      {content}
    </Tooltip>
  ) : (
    content
  );
} 