'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface Regime {
  id: string;
  name: string;
  description: string;
  confidence: number;
  characteristics: string[];
  examples: string[];
}

export default function RegimeIdentification() {
  const [text, setText] = useState('');
  const [regimes, setRegimes] = useState<Regime[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      // TODO: Implement regime analysis logic
      // This is a mock implementation
      const mockRegimes: Regime[] = [
        {
          id: '1',
          name: 'Democratic Regime',
          description: 'A political system characterized by free and fair elections, rule of law, and protection of civil liberties',
          confidence: 0.94,
          characteristics: [
            'Free elections',
            'Rule of law',
            'Civil liberties',
            'Separation of powers',
          ],
          examples: [
            'United States',
            'United Kingdom',
            'Germany',
            'Canada',
          ],
        },
        {
          id: '2',
          name: 'Authoritarian Regime',
          description: 'A political system characterized by centralized power and limited political freedoms',
          confidence: 0.87,
          characteristics: [
            'Centralized power',
            'Limited freedoms',
            'State control',
            'Suppressed opposition',
          ],
          examples: [
            'North Korea',
            'China',
            'Russia',
            'Iran',
          ],
        },
      ];
      setRegimes(mockRegimes);
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Regime Identification
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Input Text
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={text}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
                placeholder="Enter text to analyze for political regimes..."
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleAnalyze}
                disabled={!text.trim() || isAnalyzing}
                startIcon={isAnalyzing ? <CircularProgress size={20} /> : null}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
              </Button>
            </Paper>
          </Grid>

          {regimes.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Identified Regimes
              </Typography>
              <Grid container spacing={3}>
                {regimes.map((regime) => (
                  <Grid item xs={12} md={6} key={regime.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Typography variant="h6">{regime.name}</Typography>
                          <Chip
                            label={`${(regime.confidence * 100).toFixed(1)}% confidence`}
                            size="small"
                            color="primary"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {regime.description}
                        </Typography>
                        <Typography variant="subtitle2" gutterBottom>
                          Characteristics:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                          {regime.characteristics.map((char) => (
                            <Chip
                              key={char}
                              label={char}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Examples:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {regime.examples.map((example) => (
                            <Chip
                              key={example}
                              label={example}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>
      </Container>
    </DashboardLayout>
  );
} 