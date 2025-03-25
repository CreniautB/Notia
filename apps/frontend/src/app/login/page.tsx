'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Paper, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { serverApi } from '../../utils/server-api';

// URL de l'API backend avec valeur par défaut en cas de non-définition
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export default function LoginPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fonction pour rediriger vers Google Auth
  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';
    console.log("Redirection vers Google Auth:", `${apiUrl}/api/auth/google`);
    
    // Utiliser window.location pour une redirection complète de la page
    // Cela permet d'éviter les problèmes de CORS avec les cookies
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await serverApi.get<{ isAuthenticated: boolean, user: any }>('/auth/status');
        
        // Si l'utilisateur est déjà connecté et est admin, rediriger vers le backoffice
        if (response.data?.isAuthenticated && response.data?.user?.isAdmin) {
          router.push('/backoffice');
          return;
        }
      } catch (error) {
        // Erreur silencieuse
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Connexion à l'administration
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          Veuillez vous connecter avec Google pour accéder au backoffice
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleGoogleLogin}
          sx={{ mt: 2 }}
        >
          Se connecter avec Google
        </Button>
      </Paper>
    </Container>
  );
} 