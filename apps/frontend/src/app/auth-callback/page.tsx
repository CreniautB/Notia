'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
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
  }, [router, searchParams]);

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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh'
      }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Chargement...
        </Typography>
      </Box>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
} 