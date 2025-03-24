import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  FormControl,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { QuizTheme, QuizDifficulty } from '@notia/shared/interfaces/QuizTypes';
import { formatEnumValue } from './QuestionFilters';
import { serverApi } from '../../../utils/server-api';
import { Notification } from './Notification';

export interface Question {
  _id: string;
  content: string;
  theme: QuizTheme;
  difficulty: QuizDifficulty;
  createdAt: string;
}

interface QuestionsTableProps {
  questions: Question[];
  onQuestionUpdated: () => void;
}

export const QuestionsTable = ({ questions, onQuestionUpdated }: QuestionsTableProps) => {
  const [loadingTheme, setLoadingTheme] = useState<string | null>(null);
  const [loadingDifficulty, setLoadingDifficulty] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleThemeChange = async (questionId: string, newTheme: string) => {
    try {
      setLoadingTheme(questionId);
      await serverApi.put(`/questions/${questionId}`, {
        theme: newTheme
      });
      // Informer le parent que la question a été mise à jour
      onQuestionUpdated();
      setNotification({
        open: true,
        message: 'Thème mis à jour avec succès',
        severity: 'success'
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du thème:", error);
      setNotification({
        open: true,
        message: 'Erreur lors de la mise à jour du thème',
        severity: 'error'
      });
    } finally {
      setLoadingTheme(null);
    }
  };

  const handleDifficultyChange = async (questionId: string, newDifficulty: string) => {
    try {
      setLoadingDifficulty(questionId);
      await serverApi.put(`/questions/${questionId}`, {
        difficulty: newDifficulty
      });
      // Informer le parent que la question a été mise à jour
      onQuestionUpdated();
      setNotification({
        open: true,
        message: 'Difficulté mise à jour avec succès',
        severity: 'success'
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la difficulté:", error);
      setNotification({
        open: true,
        message: 'Erreur lors de la mise à jour de la difficulté',
        severity: 'error'
      });
    } finally {
      setLoadingDifficulty(null);
    }
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="tableau des questions">
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Thème</TableCell>
              <TableCell>Difficulté</TableCell>
              <TableCell>Date de création</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.length > 0 ? (
              questions.map((question) => (
                <TableRow key={question._id}>
                  <TableCell>{question.content}</TableCell>
                  
                  <TableCell>
                    <FormControl fullWidth size="small">
                      {loadingTheme === question._id ? (
                        <CircularProgress size={24} sx={{ mx: 'auto', my: 1 }} />
                      ) : (
                        <Select
                          value={question.theme}
                          onChange={(e) => handleThemeChange(question._id, e.target.value)}
                        >
                          {Object.values(QuizTheme).map(theme => (
                            <MenuItem key={theme} value={theme}>{formatEnumValue(theme)}</MenuItem>
                          ))}
                        </Select>
                      )}
                    </FormControl>
                  </TableCell>
                  
                  <TableCell>
                    <FormControl fullWidth size="small">
                      {loadingDifficulty === question._id ? (
                        <CircularProgress size={24} sx={{ mx: 'auto', my: 1 }} />
                      ) : (
                        <Select
                          value={question.difficulty}
                          onChange={(e) => handleDifficultyChange(question._id, e.target.value)}
                        >
                          {Object.values(QuizDifficulty).map(difficulty => (
                            <MenuItem key={difficulty} value={difficulty}>{formatEnumValue(difficulty)}</MenuItem>
                          ))}
                        </Select>
                      )}
                    </FormControl>
                  </TableCell>
                  
                  <TableCell>{new Date(question.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Aucune question trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </>
  );
}; 