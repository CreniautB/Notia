'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Radio, Card, Paper } from '@mui/material';
import { MultipleChoiceQuestion as MCQType } from '@notia/shared';
import Image from 'next/image';

interface Option {
  _id?: string;
  id?: string;
  content: string;
  isCorrect?: boolean;
  mediaUrl?: string;
  mediaAssetId?: string;
  mediaType?: 'image' | 'audio' | 'video';
}

interface MultipleChoiceQuestionProps {
  question: MCQType;
  onAnswer: (optionContent: string) => void;
  disabled?: boolean;
  onNextQuestion?: () => void;
}

export const MultipleChoiceQuestion = ({
  question,
  onAnswer,
  disabled = false,
  onNextQuestion,
}: MultipleChoiceQuestionProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctOptionId, setCorrectOptionId] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<Option[]>([]);

  const getOptionId = (option: Option): string => {
    return option._id || option.id || '';
  };

  // Fonction pour mélanger un tableau (algorithme de Fisher-Yates)
  const shuffleArray = (array: Option[]): Option[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  useEffect(() => {
    // Mélanger les options au chargement de la question
    setShuffledOptions(shuffleArray(question.options));

    const correctOption = question.options.find((opt) => opt.isCorrect);
    if (correctOption) {
      setCorrectOptionId(getOptionId(correctOption));
    }

    // Réinitialiser l'état de sélection et de feedback lorsque la question change
    setSelectedOption(null);
    setShowFeedback(false);
  }, [question]);

  const handleOptionSelect = (optionId: string) => {
    const selectedOptionObj = question.options.find((opt) => getOptionId(opt) === optionId);

    setSelectedOption(optionId);
    setShowFeedback(true);

    if (selectedOptionObj) {
      onAnswer(selectedOptionObj.content);
    } else {
      onAnswer(optionId);
    }

    if (onNextQuestion) {
      setTimeout(() => {
        onNextQuestion();
      }, 1500);
    }
  };

  const getOptionColor = (optionId: string) => {
    if (!showFeedback) return undefined;

    if (optionId === correctOptionId) {
      return '#4caf50';
    } else if (optionId === selectedOption && optionId !== correctOptionId) {
      return '#f44336';
    }

    return undefined;
  };

  // Fonction pour obtenir l'URL de l'image à afficher (mediaUrl ou mediaAssetId)
  const getMediaUrl = (item: { mediaAssetId?: string; mediaUrl?: string }) => {
    if (item.mediaAssetId) {
      return `/api/media/${item.mediaAssetId}`;
    }
    return item.mediaUrl;
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        {question.content}
      </Typography>

      {question.mediaUrl && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          {question.mediaType === 'image' && (
            <Card
              sx={{ maxWidth: 500, width: '100%', mx: 'auto', overflow: 'hidden', borderRadius: 2 }}
            >
              <Box sx={{ position: 'relative', height: '300px' }}>
                <Image
                  src={getMediaUrl(question) || ''}
                  alt={question.content}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            </Card>
          )}
          {question.mediaType === 'audio' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2, width: '100%' }}>
              <audio
                controls
                src={getMediaUrl(question)}
                style={{ width: '100%', maxWidth: '500px' }}
              >
                Votre navigateur ne supporte pas l&apos;élément audio.
              </audio>
            </Box>
          )}
          {question.mediaType === 'video' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2, width: '100%' }}>
              <video
                controls
                width="500"
                src={getMediaUrl(question)}
                style={{ width: '100%', maxWidth: '500px' }}
              >
                Votre navigateur ne supporte pas l&apos;élément vidéo.
              </video>
            </Box>
          )}
        </Box>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        {shuffledOptions.map((option: Option) => {
          const optionId = getOptionId(option);
          return (
            <Card
              key={optionId}
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                cursor: disabled || showFeedback ? 'default' : 'pointer',
                transition: 'all 0.2s',
                borderRadius: '8px',
                borderColor: getOptionColor(optionId) || 'primary.main',
                backgroundColor: getOptionColor(optionId),
                color:
                  showFeedback && (optionId === correctOptionId || optionId === selectedOption)
                    ? 'white'
                    : undefined,
                '&:hover': {
                  boxShadow: disabled || showFeedback ? undefined : '0 4px 8px rgba(0,0,0,0.1)',
                  transform: disabled || showFeedback ? undefined : 'translateY(-2px)',
                },
              }}
              onClick={() => {
                if (!disabled && !showFeedback) {
                  handleOptionSelect(optionId);
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Radio
                  checked={selectedOption === optionId}
                  disabled={disabled || showFeedback}
                  sx={{ mr: 1 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', flexGrow: 1 }}>
                  <Typography sx={{ fontWeight: selectedOption === optionId ? 'bold' : 'normal' }}>
                    {option.content}
                  </Typography>
                  {(option.mediaUrl || option.mediaAssetId) && option.mediaType === 'image' && (
                    <Box
                      sx={{
                        ml: 2,
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <Image
                        src={getMediaUrl(option) || ''}
                        alt={option.content}
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </Box>
                  )}
                  {(option.mediaUrl || option.mediaAssetId) && option.mediaType === 'audio' && (
                    <Box sx={{ ml: 2, width: '100%', maxWidth: '200px' }}>
                      <audio
                        controls
                        src={getMediaUrl(option)}
                        style={{ height: 30, width: '100%' }}
                      >
                        Votre navigateur ne supporte pas l&apos;élément audio.
                      </audio>
                    </Box>
                  )}
                </Box>
              </Box>
            </Card>
          );
        })}
      </Box>
    </Paper>
  );
};
