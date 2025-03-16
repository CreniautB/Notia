'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Card, Button } from '@mui/material';
import { TextInputQuestion as TextInputQuestionType } from '@notia/shared/interfaces/QuizTypes';

interface TextInputQuestionProps {
  question: TextInputQuestionType;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  onNextQuestion?: () => void;
}

export const TextInputQuestion = ({
  question,
  onAnswer,
  disabled = false,
  onNextQuestion,
}: TextInputQuestionProps) => {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (showFeedback && onNextQuestion) {
      const timer = setTimeout(() => {
        onNextQuestion();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [showFeedback, onNextQuestion]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(event.target.value);
  };

  const handleSubmit = () => {
    if (answer.trim() && !submitted) {
      // Vérifier si la réponse est correcte
      const normalizedUserAnswer = answer
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .trim();

      const normalizedAcceptableAnswers = question.acceptableAnswers.map((ans: string) =>
        ans
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s]/g, '')
          .trim()
      );

      const correct = normalizedAcceptableAnswers.includes(normalizedUserAnswer);
      setIsCorrect(correct);

      onAnswer(answer);
      setSubmitted(true);
      setShowFeedback(true);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !submitted) {
      handleSubmit();
    }
  };

  // Déterminer la couleur de fond en fonction de la réponse
  const getFeedbackColor = () => {
    if (!showFeedback) return undefined;
    return isCorrect ? '#4caf50' : '#f44336'; // Vert si correct, rouge si incorrect
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {question.content}
      </Typography>

      {question.mediaUrl && (
        <Box sx={{ mb: 2 }}>
          {question.mediaType === 'image' && (
            <Card sx={{ maxWidth: 500, mx: 'auto' }}>
              {/* <CardMedia
                component="img"
                height="300"
                image={question.mediaUrl}
                alt={question.content}
                sx={{ objectFit: 'contain' }}
              /> */}
            </Card>
          )}
          {question.mediaType === 'audio' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <audio controls src={question.mediaUrl}>
                Votre navigateur ne supporte pas l&apos;élément audio.
              </audio>
            </Box>
          )}
          {question.mediaType === 'video' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <video controls width="500" src={question.mediaUrl}>
                Votre navigateur ne supporte pas l&apos;élément vidéo.
              </video>
            </Box>
          )}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 3,
          ...(showFeedback && {
            backgroundColor: getFeedbackColor(),
            padding: 2,
            borderRadius: 2,
          }),
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Votre réponse..."
          value={answer}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          disabled={disabled || submitted}
          sx={{
            maxWidth: 500,
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
            ...(showFeedback && {
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                color: 'white',
                '& fieldset': { borderColor: 'white' },
              },
            }),
          }}
        />

        {showFeedback && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
              {isCorrect
                ? 'Bonne réponse !'
                : `Réponse incorrecte. La bonne réponse était : ${question.acceptableAnswers[0]}`}
            </Typography>
          </Box>
        )}

        {!showFeedback && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={disabled || submitted || !answer.trim()}
            sx={{ minWidth: 120 }}
          >
            Valider
          </Button>
        )}
      </Box>
    </Box>
  );
};
