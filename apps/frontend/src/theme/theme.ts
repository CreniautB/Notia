import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { fontConfig } from './fonts';
import { QuizTheme, QuizDifficulty } from '@notia/shared/interfaces/QuizTypes';

// Types pour les icônes
type IconName = 'public' | 'history' | 'science' | 'menu_book' | 'palette' | 'sports_soccer' | 'psychology';

// Déclaration des modules pour le thème personnalisé
declare module '@mui/material/styles' {
  interface TypographyVariants {
    smallBold: React.CSSProperties;
  }

  // Permettre la configuration via createTheme()
  interface TypographyVariantsOptions {
    smallBold?: React.CSSProperties;
  }
  
  // Étendre le thème avec notre configuration de quiz
  interface Theme {
    quizTheme: {
      themes: Record<QuizTheme, {
        color: string;
        label: string;
        iconColor: string;
        icon: IconName;
      }>;
      difficulties: Record<QuizDifficulty, {
        color: string;
        label: string;
        dots: number;
      }>;
    };
  }
  
  interface ThemeOptions {
    quizTheme?: {
      themes?: Record<QuizTheme, {
        color: string;
        label: string;
        iconColor: string;
        icon: IconName;
      }>;
      difficulties?: Record<QuizDifficulty, {
        color: string;
        label: string;
        dots: number;
      }>;
    };
  }
  
  // Ajouter 'orange' aux options de palette
  interface Palette {
    orange: Palette['primary'];
  }
  
  interface PaletteOptions {
    orange?: PaletteOptions['primary'];
  }
}

// Mettre à jour les options de variante prop Typography
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    smallBold: true;
  }
}

// Palette de couleurs
const secondaryColor = '#f50057';
const successColor = '#4caf50';
const errorColor = '#f44336';
const warningColor = '#ff9800';
const infoColor = '#2196f3';
const orangeColor = '#ff5722';

// Breakpoints pour le responsive
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

// Configuration des thèmes de quiz
const quizThemes = {
  [QuizTheme.GEOGRAPHY]: {
    color: 'success.main',
    label: 'Géographie',
    iconColor: 'success.main',
    icon: 'public' as IconName
  },
  [QuizTheme.HISTORY]: {
    color: 'warning.main',
    label: 'Histoire',
    iconColor: 'warning.main',
    icon: 'history' as IconName
  },
  [QuizTheme.SCIENCE]: {
    color: 'info.main',
    label: 'Sciences',
    iconColor: 'info.main',
    icon: 'science' as IconName
  },
  [QuizTheme.LITERATURE]: {
    color: 'secondary.main',
    label: 'Littérature',
    iconColor: 'secondary.main',
    icon: 'menu_book' as IconName
  },
  [QuizTheme.ARTS]: {
    color: 'error.light',
    label: 'Arts',
    iconColor: 'error.light',
    icon: 'palette' as IconName
  },
  [QuizTheme.SPORTS]: {
    color: 'orange.main',
    label: 'Sports',
    iconColor: 'orange.main',
    icon: 'sports_soccer' as IconName
  },
  [QuizTheme.GENERAL_KNOWLEDGE]: {
    color: 'grey.600',
    label: 'Culture générale',
    iconColor: 'grey.600',
    icon: 'psychology' as IconName
  },
};

// Configuration des niveaux de difficulté
const quizDifficulties = {
  [QuizDifficulty.EASY]: {
    color: 'success.main',
    label: 'Facile',
    dots: 1,
  },
  [QuizDifficulty.MEDIUM]: {
    color: 'warning.main',
    label: 'Moyen',
    dots: 2,
  },
  [QuizDifficulty.HARD]: {
    color: 'error.main',
    label: 'Difficile',
    dots: 3,
  },
};

// Création du thème de base
let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0b1626',
    },
    secondary: {
      main: secondaryColor,
    },
    success: {
      main: successColor,
    },
    error: {
      main: errorColor,
    },
    warning: {
      main: warningColor,
    },
    info: {
      main: infoColor,
    },
    orange: {
      main: orangeColor,
      light: '#ff8a50',
      dark: '#c41c00',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#0b1626',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
  },
  typography: {
    fontFamily: fontConfig.bodyFontFamily,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      fontFamily: fontConfig.titleFontFamily,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      fontFamily: fontConfig.bodyFontFamily,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      fontFamily: fontConfig.bodyFontFamily,
    },
    h4: {
      fontSize: '1.2rem',
      fontWeight: 500,
      fontFamily: fontConfig.bodyFontFamily,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    smallBold: {
      fontSize: '0.750rem',
      fontWeight: 700,
      lineHeight: 1.43,
    },
  },
  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          smallBold: 'p',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        containedPrimary: {
          boxShadow: '0 4px 6px rgba(63, 81, 181, 0.25)',
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          listStyleType: 'none',
          padding: 0,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingLeft: 0,
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          padding: 0,
          marginRight: '8px',
          '& svg': {
            display: 'none',
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          marginLeft: 0,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
  // Ajouter notre configuration de quiz au thème
  quizTheme: {
    themes: quizThemes,
    difficulties: quizDifficulties,
  },
});

// Rendre les polices responsives
theme = responsiveFontSizes(theme);

export default theme;

// Export des configurations de quiz pour compatibilité avec le code existant
export const quizThemeConfig = quizThemes;
export const quizDifficultyConfig = quizDifficulties;
