import { Box, Button } from '@mui/material';

interface AddQuestionButtonProps {
  onClick: () => void;
}

export const AddQuestionButton = ({ onClick }: AddQuestionButtonProps) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Button 
        variant="contained" 
        color="primary"
        onClick={onClick}
      >
        Ajouter une question
      </Button>
    </Box>
  );
}; 