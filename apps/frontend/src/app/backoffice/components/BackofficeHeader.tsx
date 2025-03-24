import { Typography, Box, Button, Divider } from '@mui/material';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  isAdmin: boolean;
}

interface BackofficeHeaderProps {
  user: User | null;
  apiUrl: string;
}

export const BackofficeHeader = ({ user, apiUrl }: BackofficeHeaderProps) => {
  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Administration des Questions
        </Typography>
        <Typography variant="body1">
          Bienvenue, {user?.email}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          href={`${apiUrl}/api/auth/logout`}
          sx={{ mt: 2 }}
        >
          Déconnexion
        </Button>
      </Box>

      <Divider sx={{ mb: 4 }} />
    </>
  );
}; 