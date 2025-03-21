import React from 'react';
import { Container, Paper, ContainerProps, PaperProps } from '@mui/material';

interface ContentCardProps {
  children: React.ReactNode;
  containerProps?: Partial<ContainerProps>;
  paperProps?: Partial<PaperProps>;
}

/**
 * Composant ContentCard réutilisable qui encapsule un Container et un Paper
 * avec des propriétés personnalisables pour chacun.
 */
export function ContentCard({ children, containerProps = {}, paperProps = {} }: ContentCardProps) {
  // Valeurs par défaut pour Container
  const defaultContainerProps: Partial<ContainerProps> = {
    maxWidth: 'md',
    sx: { mt: 4 },
  };

  // Valeurs par défaut pour Paper
  const defaultPaperProps: Partial<PaperProps> = {
    sx: { p: 4, borderRadius: 3, boxShadow: 0 },
  };

  // Fusion des props par défaut avec les props personnalisées
  const mergedContainerProps = {
    ...defaultContainerProps,
    ...containerProps,
    sx: { ...defaultContainerProps.sx, ...containerProps.sx },
  };

  const mergedPaperProps = {
    ...defaultPaperProps,
    ...paperProps,
    sx: { ...defaultPaperProps.sx, ...paperProps.sx },
  };

  return (
    <Container {...mergedContainerProps}>
      <Paper {...mergedPaperProps}>{children}</Paper>
    </Container>
  );
}
