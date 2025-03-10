'use client';
import { parse } from 'date-fns';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { historicEvents } from '../mock/timeline';

// Définir l'interface localement pour l'instant
interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  imageUrl: string;
  wikipediaUrl: string;
}

const getDateRange = (events: TimelineEvent[]) => {
  const dates = events.map((e) => parse(e.date, 'dd/MM/yyyy', new Date()));
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
  return { minDate, maxDate };
};

const getEventPosition = (date: string, minDate: Date, maxDate: Date) => {
  const eventDate = parse(date, 'dd/MM/yyyy', new Date());
  const totalRange = maxDate.getTime() - minDate.getTime();
  const eventPosition = eventDate.getTime() - minDate.getTime();
  return (eventPosition / totalRange) * 100;
};

const TimelinePage = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { minDate, maxDate } = getDateRange(historicEvents);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const sortedEvents = [...historicEvents].sort((a, b) => {
    const dateA = parse(a.date, 'dd/MM/yyyy', new Date());
    const dateB = parse(b.date, 'dd/MM/yyyy', new Date());
    return dateA.getTime() - dateB.getTime();
  });

  // Calculer la largeur du conteneur au chargement
  useEffect(() => {
    if (timelineRef.current) {
      const width = timelineRef.current.clientWidth;
      setContainerWidth(width);

      // Positionner initialement au début de la timeline avec le padding
      setPosition(0);
    }

    // Recalculer si la fenêtre est redimensionnée
    const handleResize = () => {
      if (timelineRef.current) {
        const width = timelineRef.current.clientWidth;
        setContainerWidth(width);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Limites de déplacement ajustées avec padding
  const paddingVw = 10; // 10vw de padding
  const paddingPx = (window.innerWidth * paddingVw) / 100; // Conversion en pixels
  const minPosition = -(containerWidth - paddingPx); // Limite gauche avec padding
  const maxPosition = 0; // Limite droite (début de la timeline)

  // Gestion du zoom avec la molette
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((prev) => Math.max(0.5, Math.min(prev + delta, 5)));
    }
  };

  // Gestion du glisser-déposer
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX - position);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newPosition = e.clientX - startX;
      // Limiter le déplacement
      setPosition(Math.min(Math.max(newPosition, minPosition), maxPosition));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Modifier également la fonction handleGlobalMouseMove
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = e.clientX - startX;
        // Limiter le déplacement
        setPosition(Math.min(Math.max(newPosition, minPosition), maxPosition));
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging, startX, minPosition, maxPosition]);

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)',
      }}
      onWheel={handleWheel}
    >
      <Box
        ref={timelineRef}
        sx={{
          position: 'relative',
          height: '100%',
          width: '200vw',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '5%',
            width: '180vw',
            height: '10px',
            backgroundColor: 'black',
            transform: `translateX(${position}px) scale(${scale}, 1) translateY(-50%)`,
            transformOrigin: 'left center',
          }}
        >
          {sortedEvents.map((event) => {
            const positionPercent = getEventPosition(event.date, minDate, maxDate);

            return (
              <Box
                key={event.id}
                sx={{
                  position: 'absolute',
                  left: `${positionPercent}%`,
                  transform: 'translate(-50%, -50%)',
                  top: '50%',
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '4px',
                    bgcolor: 'white',
                    cursor: 'pointer',
                    border: '5px solid grey',
                    transition: 'transform 0.2s',
                  }}
                />

                <Card
                  sx={{
                    position: 'absolute',
                    top: 32,
                    left: -70,
                    width: 140,
                    opacity: 1,
                    transform: 'scale(1)',
                    transition: 'all 0.3s ease-in-out',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                      zIndex: 1,
                      '& .description-text': {
                        maxHeight: '300px',
                        WebkitLineClamp: 'unset',
                      },
                    },
                  }}
                  elevation={8}
                >
                  <CardMedia component="div" sx={{ position: 'relative', height: 120 }}>
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      priority
                    />
                  </CardMedia>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {event.title}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {event.date}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="description-text"
                      sx={{
                        mt: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        transition: 'all 0.4s ease-in-out',
                        maxHeight: '4.5em',
                      }}
                    >
                      {event.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default TimelinePage;
