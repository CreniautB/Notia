'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Paper,
  Divider,
  Grid,
  IconButton,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { serverApi } from '../../../utils/server-api';
import { LoadingState } from '../components';
import { QuizTheme, QuizDifficulty } from '@notia/shared/interfaces/QuizTypes';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface AuthStatus {
  isAuthenticated: boolean;
  user: {
    isAdmin: boolean;
    email: string;
  } | null;
}

// Fonction pour convertir les clés enum en texte lisible
const formatEnumValue = (value: string): string => {
  return value.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

export default function AddQuestionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);

  // État du formulaire
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState<string>(QuizTheme.GENERAL_KNOWLEDGE);
  const [difficulty, setDifficulty] = useState<string>(QuizDifficulty.MEDIUM);
  const [options, setOptions] = useState([
    { content: '', isCorrect: true },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false }
  ]);

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await serverApi.get<AuthStatus>('/auth/status');
        setAuthStatus(response.data);

        if (!response.data?.isAuthenticated || !response.data?.user?.isAdmin) {
          router.push('/login');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Mettre à jour le contenu d'une option
  const handleOptionContentChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].content = value;
    setOptions(newOptions);
  };

  // Définir quelle option est correcte
  const handleCorrectOptionChange = (index: number) => {
    const newOptions = options.map((option, i) => ({
      ...option,
      isCorrect: i === index
    }));
    setOptions(newOptions);
  };

  // Ajouter une option
  const handleAddOption = () => {
    if (options.length < 8) {
      setOptions([...options, { content: '', isCorrect: false }]);
    }
  };

  // Supprimer une option
  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      
      // Si l'option supprimée était marquée comme correcte, définir la première comme correcte
      if (options[index].isCorrect && newOptions.length > 0) {
        newOptions[0].isCorrect = true;
      }
      
      setOptions(newOptions);
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    try {
      // Vérifier que tous les champs sont remplis
      if (!content.trim()) {
        alert('Veuillez saisir le contenu de la question');
        return;
      }

      // Vérifier que toutes les options ont un contenu
      if (options.some(option => !option.content.trim())) {
        alert('Toutes les options doivent avoir un contenu');
        return;
      }

      // Vérifier qu'une option est marquée comme correcte
      if (!options.some(option => option.isCorrect)) {
        alert('Une option doit être marquée comme correcte');
        return;
      }

      // Créer la nouvelle question
      const questionData = {
        content,
        theme,
        difficulty,
        type: 'multiple_choice',
        options,
        points: difficulty === QuizDifficulty.EASY ? 1 : difficulty === QuizDifficulty.MEDIUM ? 2 : 3
      };

      await serverApi.post('/questions', questionData);
      alert('Question ajoutée avec succès !');
      router.push('/backoffice');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la question:', error);
      alert('Erreur lors de l\'ajout de la question');
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!authStatus?.isAuthenticated || !authStatus?.user?.isAdmin) {
    return <LoadingState />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton 
          onClick={() => router.push('/backoffice')} 
          sx={{ mr: 2 }}
          aria-label="retour"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Ajouter une Question
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Informations générales
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Contenu de la question"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              multiline
              rows={2}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="theme-label">Thème</InputLabel>
              <Select
                labelId="theme-label"
                value={theme}
                label="Thème"
                onChange={(e) => setTheme(e.target.value)}
              >
                {Object.values(QuizTheme).map((themeValue) => (
                  <MenuItem key={themeValue} value={themeValue}>
                    {formatEnumValue(themeValue)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="difficulty-label">Difficulté</InputLabel>
              <Select
                labelId="difficulty-label"
                value={difficulty}
                label="Difficulté"
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {Object.values(QuizDifficulty).map((difficultyValue) => (
                  <MenuItem key={difficultyValue} value={difficultyValue}>
                    {formatEnumValue(difficultyValue)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Options de réponse
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {options.map((option, index) => (
          <Card key={index} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label={`Option ${index + 1}`}
                    value={option.content}
                    onChange={(e) => handleOptionContentChange(index, e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={option.isCorrect}
                        onChange={() => handleCorrectOptionChange(index)}
                        color="primary"
                      />
                    }
                    label="Correcte"
                  />
                </Grid>
                <Grid item xs={1}>
                  <IconButton 
                    onClick={() => handleRemoveOption(index)}
                    disabled={options.length <= 2}
                    aria-label="supprimer l'option"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}

        <Box sx={{ mt: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleAddOption}
            disabled={options.length >= 8}
          >
            Ajouter une option
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          color="error"
          onClick={() => router.push('/backoffice')}
        >
          Annuler
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSubmit}
        >
          Enregistrer la question
        </Button>
      </Box>
    </Container>
  );
} 