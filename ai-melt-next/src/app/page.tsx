'use client';

import { Box, Container, Typography } from '@mui/material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Home() {
  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to AI Melt
          </Typography>
          <Typography variant="body1">
            Select a feature from the sidebar to begin analyzing your documents.
          </Typography>
        </Box>
      </Container>
    </DashboardLayout>
  );
}
