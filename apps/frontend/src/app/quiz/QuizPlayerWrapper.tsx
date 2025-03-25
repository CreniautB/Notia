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
  Fade,
} from '@mui/material';
import type { Quiz } from './types';
import { ContentCard } from '@/components/ContentCard';

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<typeof quiz.questions[0]['options']>([]);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  // Fonction pour mélanger un tableau
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Mélanger les options quand la question change
  useEffect(() => {
    setShuffledOptions(shuffleArray(currentQuestion.options));
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (selectedAnswer !== null) {
      const correctOption = currentQuestion.options.find((option) => option.isCorrect);
      const isCorrect = correctOption && selectedAnswer === correctOption.content;
      if (isCorrect) {
        setScore((prev) => prev + currentQuestion.points);
      }

      // Déclencher l'animation de sortie
      const transitionOutTimer = setTimeout(() => {
        setIsTransitioning(true);
      }, 800);

      // Changer de question après l'animation de sortie
      const questionChangeTimer = setTimeout(() => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          
          // Réinitialiser l'animation pour la prochaine question
          setTimeout(() => {
            setIsTransitioning(false);
          }, 50);
        } else {
          setIsQuizCompleted(true);
        }
      }, 1250);

      return () => {
        clearTimeout(transitionOutTimer);
        clearTimeout(questionChangeTimer);
      };
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
    setIsTransitioning(false);
    setShuffledOptions(shuffleArray(currentQuestion.options));
  };

  if (isQuizCompleted) {
    const totalPoints = quiz.questions.reduce((acc, question) => acc + question.points, 0);
    return (
      <ContentCard>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Fade in timeout={800}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Quiz terminé !
              </Typography>
              <Typography variant="h5" gutterBottom>
                Votre score : {score} / {totalPoints} points
              </Typography>
              <Button 
                variant="outlined" 
                onClick={handleRestartQuiz} 
                sx={{ 
                  mt: 2,
                  fontSize: '1.1rem',
                }}
              >
                Nouveau quiz
              </Button>
            </Box>
          </Fade>
        </Box>
      </ContentCard>
    );
  }

  // Le contenu de la question et des réponses
  const questionContent = (
    <>
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
              {shuffledOptions.map((option) => {
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
                        backgroundColor: showFeedback
                          ? backgroundColor
                          : alpha(theme.palette.primary.main, 0.04),
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
    </>
  );

  return (
    <ContentCard>
      <Box>
        <Fade in={!isTransitioning} timeout={500}>
          <Box>{questionContent}</Box>
        </Fade>
      </Box>
    </ContentCard>
  );
}
