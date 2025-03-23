'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  useTheme,
  alpha,
  Grid,
} from '@mui/material';
import type { Quiz } from './types';

interface QuizPlayerWrapperProps {
  quiz: Quiz;
}

export function QuizPlayerWrapper({ quiz }: QuizPlayerWrapperProps) {
  const theme = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  useEffect(() => {
    if (selectedAnswer !== null) {
      const correctOption = currentQuestion.options.find((option) => option.isCorrect);
      const isCorrect = correctOption && selectedAnswer === correctOption.content;
      if (isCorrect) {
        setScore((prev) => prev + currentQuestion.points);
      }

      const timer = setTimeout(() => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
        } else {
          setIsQuizCompleted(true);
        }
      }, 1250);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [selectedAnswer, currentQuestion, currentQuestionIndex, quiz.questions.length]);

  const handleAnswerSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isQuizCompleted || selectedAnswer !== null) return;
    const answer = event.target.value;
    setSelectedAnswer(answer);
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setSelectedAnswer(null);
    setIsQuizCompleted(false);
    setScore(0);
  };

  if (isQuizCompleted) {
    const totalPoints = quiz.questions.reduce((acc, question) => acc + question.points, 0);
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Quiz terminé !
        </Typography>
        <Typography variant="h5" gutterBottom>
          Votre score : {score} / {totalPoints} points
        </Typography>
        <Button variant="contained" color="primary" onClick={handleRestartQuiz} sx={{ mt: 2 }}>
          Recommencer le quiz
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="smallBold" gutterBottom>
        Question {currentQuestionIndex + 1} sur {quiz.questions.length}
      </Typography>
      <Typography variant="h4" gutterBottom>
        {currentQuestion.content}
      </Typography>
      {currentQuestion.type === 'multiple_choice' && (
        <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
          <RadioGroup value={selectedAnswer || ''} onChange={handleAnswerSelect}>
            <Grid container spacing={2}>
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option.content;
                const isCorrect = option.isCorrect;
                const showFeedback = selectedAnswer !== null;

                let backgroundColor = 'transparent';
                if (showFeedback) {
                  if (isCorrect) {
                    backgroundColor = alpha(theme.palette.success.main, 0.5);
                  } else if (isSelected) {
                    backgroundColor = alpha(theme.palette.error.main, 0.5);
                  } else {
                    backgroundColor = alpha(theme.palette.primary.main, 0.04);
                  }
                }

                return (
                  <Grid item xs={12} sm={6} key={option._id}>
                    <FormControlLabel
                      value={option.content}
                      control={<Radio />}
                      label={option.content}
                      sx={{
                        borderRadius: 1,
                        p: 2,
                        width: '100%',
                        m: 'auto',
                        transition: 'all 0.2s ease-in-out',
                        backgroundColor: showFeedback
                          ? backgroundColor
                          : alpha(theme.palette.primary.main, 0.04),
                        '&:hover': {
                          backgroundColor: showFeedback
                            ? backgroundColor
                            : alpha(theme.palette.primary.main, 0.08),
                        },
                        '& .MuiFormControlLabel-label': {
                          textAlign: 'center',
                          width: '100%',
                          fontSize: '1.3rem',
                          fontWeight: 'bold',
                        },
                      }}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </RadioGroup>
        </FormControl>
      )}
    </Box>
  );
}
