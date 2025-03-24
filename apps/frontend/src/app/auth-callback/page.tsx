'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function AuthCallbackPage() {
  const router = useRouter();

  // Utiliser useCallback pour éviter les re-rendus inutiles
  const processAuth = useCallback(async () => {
    try {
      // Récupérer le token directement
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        // Stocker le token dans localStorage
        localStorage.setItem('auth_token', token);
        console.log('Token sauvegardé dans localStorage');
        
        // Rediriger vers le backoffice
        router.push('/backoffice');
      } else {
        console.error('Aucun token trouvé dans les paramètres URL');
        router.push('/login');
      }
    } catch (error) {
      console.error('Erreur lors du traitement du callback:', error);
      router.push('/login');
    }
  }, [router]);

  // Exécuter une seule fois au chargement du composant
  useEffect(() => {
    processAuth();
  }, [processAuth]);

  // Afficher un spinner pendant le traitement
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh'
    }}>
      <CircularProgress />
      <Typography variant="body1" sx={{ mt: 2 }}>
        Authentification en cours...
      </Typography>
    </Box>
  );
} 