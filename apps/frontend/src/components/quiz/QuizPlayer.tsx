'use client';
import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, LinearProgress, Container } from '@mui/material';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { TextInputQuestion } from './TextInputQuestion';
import {
  Quiz,
  QuestionType,
  MultipleChoiceQuestion as MCQType,
  TextInputQuestion as TIQType,
} from '@notia/shared/interfaces/QuizTypes';

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (results: QuizResult) => void;
}

export interface QuizResult {
  quizId: string;
  score: number;
  maxScore: number;
  answers: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    points: number;
  }[];
}

interface QuestionOption {
  isCorrect: boolean;
  content: string;
}

export const QuizPlayer = ({ quiz, onComplete }: QuizPlayerProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: string; selectedAnswer: string; isCorrect: boolean; timeSpent: number }[]
  >([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);

  const limitedQuestions = quiz.questions.slice(0, 10);
  const currentQuestion = limitedQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / limitedQuestions.length) * 100;

  const handleAnswer = useCallback(
    (selectedAnswer: string) => {
      if (isAnswered) return;

      const timeSpent = 30 - timeLeft;
      const questionOptions =
        currentQuestion.type === QuestionType.MULTIPLE_CHOICE
          ? (currentQuestion as MCQType).options
          : [];
      const correctAnswer = questionOptions.find((opt: QuestionOption) => opt.isCorrect);
      const isCorrect = correctAnswer?.content === selectedAnswer;

      if (isCorrect) {
        setScore((prev) => prev + 1);
      }

      setAnswers((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          selectedAnswer,
          isCorrect,
          timeSpent,
        },
      ]);

      setIsAnswered(true);
    },
    [currentQuestion, timeLeft, isAnswered]
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isAnswered && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      handleAnswer('');
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, handleAnswer, isAnswered]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < limitedQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeLeft(30);
      setIsAnswered(false);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    const quizResults: QuizResult = {
      quizId: quiz.id,
      score: score,
      maxScore: limitedQuestions.length,
      answers: answers.map((answer) => ({
        questionId: answer.questionId,
        userAnswer: answer.selectedAnswer,
        isCorrect: answer.isCorrect,
        points: answer.isCorrect ? 1 : 0,
      })),
    };

    console.log('Quiz Results:', quizResults);
    onComplete(quizResults);
  };

  if (answers.length === limitedQuestions.length) {
    return (
      <Container maxWidth="md">
        <Typography variant="h4" align="center" gutterBottom>
          Résultats du Quiz
        </Typography>
        <Typography variant="h5" align="center" color="primary" sx={{ mb: 3 }}>
          Score: {score} / {limitedQuestions.length}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(score / limitedQuestions.length) * 100}
          sx={{ height: 10, borderRadius: 5, mb: 4 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography variant="body1" align="center" sx={{ mb: 2 }}>
            Vous avez répondu correctement à {score} questions sur {limitedQuestions.length}.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Question {currentQuestionIndex + 1} / {limitedQuestions.length}
          </Typography>
          <Typography variant="body2" color={timeLeft < 10 ? 'error' : 'text.secondary'}>
            Temps restant: {timeLeft}s
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && (
        <MultipleChoiceQuestion
          question={currentQuestion as MCQType}
          onAnswer={handleAnswer}
          disabled={isAnswered}
          onNextQuestion={handleNextQuestion}
        />
      )}

      {currentQuestion.type === QuestionType.TEXT_INPUT && (
        <TextInputQuestion
          question={currentQuestion as TIQType}
          onAnswer={handleAnswer}
          disabled={isAnswered}
          onNextQuestion={handleNextQuestion}
        />
      )}
    </Container>
  );
};
