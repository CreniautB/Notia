'use client';

import React from 'react';
import { useApiGet, useApiMutation } from '../hooks/useApi';
import {
  Alert,
  Button,
  CircularProgress,
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export function TodoList() {
  const { data, loading, error, refetch } = useApiGet<Todo[]>('/todos');
  const [newTodoTitle, setNewTodoTitle] = React.useState('');

  const {
    mutate: createTodo,
    loading: isCreating,
    error: createError,
  } = useApiMutation<Todo, { title: string }>({
    onSuccess: () => {
      // Recharger la liste après création
      refetch();
      setNewTodoTitle('');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoTitle.trim()) {
      await createTodo('/todos', 'POST', { title: newTodoTitle });
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Liste des tâches
      </Typography>

      {/* Formulaire pour ajouter une tâche */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <TextField
          fullWidth
          label="Nouvelle tâche"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          disabled={isCreating}
        />
        <Button type="submit" variant="contained" disabled={isCreating || !newTodoTitle.trim()}>
          {isCreating ? <CircularProgress size={24} /> : 'Ajouter'}
        </Button>
      </form>

      {/* Erreur de création */}
      {createError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erreur lors de la création : {createError.message}
        </Alert>
      )}

      {/* État de chargement */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Erreur de chargement */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
          <Button size="small" sx={{ ml: 2 }} onClick={() => refetch()}>
            Réessayer
          </Button>
        </Alert>
      )}

      {/* Liste des tâches */}
      {!loading && !error && data && (
        <>
          {data.length === 0 ? (
            <Typography color="text.secondary">Aucune tâche pour le moment</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.map((todo) => (
                <Card key={todo.id} variant="outlined">
                  <CardContent>
                    <Typography
                      variant="body1"
                      sx={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
                    >
                      {todo.title}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
