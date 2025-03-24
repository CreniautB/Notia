import { useState, useEffect, forwardRef } from 'react';
import { Snackbar, Alert, AlertProps } from '@mui/material';

const SnackbarAlert = forwardRef<HTMLDivElement, AlertProps>(function SnackbarAlert(
  props,
  ref,
) {
  return <Alert elevation={6} ref={ref} variant="filled" {...props} />;
});

export interface NotificationProps {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  onClose: () => void;
}

export const Notification = ({ open, message, severity, onClose }: NotificationProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  useEffect(() => {
    setInternalOpen(open);
  }, [open]);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setInternalOpen(false);
    onClose();
  };

  return (
    <Snackbar
      open={internalOpen}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <SnackbarAlert onClose={handleClose} severity={severity}>
        {message}
      </SnackbarAlert>
    </Snackbar>
  );
}; 