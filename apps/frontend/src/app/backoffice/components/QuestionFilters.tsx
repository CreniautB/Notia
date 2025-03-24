import { FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import { QuizTheme, QuizDifficulty } from '@notia/shared/interfaces/QuizTypes';

// Thèmes et difficultés pour les filtres basés sur les enums
const themes = [...Object.values(QuizTheme), 'TOUS'];
const difficulties = [...Object.values(QuizDifficulty), 'TOUS'];

// Fonction pour convertir les clés enum en texte lisible
const formatEnumValue = (value: string): string => {
  if (value === 'TOUS') return 'TOUS';
  return value.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

interface QuestionFiltersProps {
  themeFilter: string;
  difficultyFilter: string;
  onThemeChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
}

export const QuestionFilters = ({
  themeFilter,
  difficultyFilter,
  onThemeChange,
  onDifficultyChange
}: QuestionFiltersProps) => {
  
  const handleThemeChange = (event: any) => {
    onThemeChange(event.target.value);
  };

  const handleDifficultyChange = (event: any) => {
    onDifficultyChange(event.target.value);
  };

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel id="theme-filter-label">Thème</InputLabel>
          <Select
            labelId="theme-filter-label"
            id="theme-filter"
            value={themeFilter}
            label="Thème"
            onChange={handleThemeChange}
          >
            {themes.map(theme => (
              <MenuItem key={theme} value={theme}>{formatEnumValue(theme)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel id="difficulty-filter-label">Difficulté</InputLabel>
          <Select
            labelId="difficulty-filter-label"
            id="difficulty-filter"
            value={difficultyFilter}
            label="Difficulté"
            onChange={handleDifficultyChange}
          >
            {difficulties.map(difficulty => (
              <MenuItem key={difficulty} value={difficulty}>{formatEnumValue(difficulty)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export { formatEnumValue }; 