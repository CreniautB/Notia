import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { fontConfig } from './fonts';

// Déclaration des modules pour le thème personnalisé
declare module '@mui/material/styles' {
  interface TypographyVariants {
    smallBold: React.CSSProperties;
  }

  // Permettre la configuration via createTheme()
  interface TypographyVariantsOptions {
    smallBold?: React.CSSProperties;
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

// Breakpoints pour le responsive
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
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
});

// Rendre les polices responsives
theme = responsiveFontSizes(theme);

export default theme;
