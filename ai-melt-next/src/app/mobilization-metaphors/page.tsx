'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface MobilizationMetaphor {
  id: string;
  text: string;
  type: string;
  effectiveness: number;
  examples: string[];
  analysis: {
    emotionalImpact: number;
    clarity: number;
    memorability: number;
    persuasiveness: number;
  };
}

export default function MobilizationMetaphors() {
  const [text, setText] = useState('');
  const [metaphors, setMetaphors] = useState<MobilizationMetaphor[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      // TODO: Implement mobilization metaphor analysis logic
      // This is a mock implementation
      const mockMetaphors: MobilizationMetaphor[] = [
        {
          id: '1',
          text: 'The people are rising like a tide',
          type: 'Natural Force',
          effectiveness: 0.92,
          examples: [
            'The Arab Spring',
            'The Civil Rights Movement',
            'The Women\'s Suffrage Movement',
          ],
          analysis: {
            emotionalImpact: 0.95,
            clarity: 0.88,
            memorability: 0.90,
            persuasiveness: 0.93,
          },
        },
        {
          id: '2',
          text: 'Breaking the chains of oppression',
          type: 'Liberation',
          effectiveness: 0.89,
          examples: [
            'The American Revolution',
            'The Anti-Apartheid Movement',
            'The Indian Independence Movement',
          ],
          analysis: {
            emotionalImpact: 0.92,
            clarity: 0.85,
            memorability: 0.88,
            persuasiveness: 0.90,
          },
        },
      ];
      setMetaphors(mockMetaphors);
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
          Mobilization Metaphors
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
                placeholder="Enter text to analyze for mobilization metaphors..."
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

          {metaphors.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Identified Mobilization Metaphors
              </Typography>
              <Grid container spacing={3}>
                {metaphors.map((metaphor) => (
                  <Grid item xs={12} md={6} key={metaphor.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Typography variant="h6">{metaphor.text}</Typography>
                          <Chip
                            label={`${(metaphor.effectiveness * 100).toFixed(1)}% effective`}
                            size="small"
                            color="primary"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Type: {metaphor.type}
                        </Typography>
                        <Typography variant="subtitle2" gutterBottom>
                          Analysis:
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary="Emotional Impact"
                              secondary={`${(metaphor.analysis.emotionalImpact * 100).toFixed(1)}%`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Clarity"
                              secondary={`${(metaphor.analysis.clarity * 100).toFixed(1)}%`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Memorability"
                              secondary={`${(metaphor.analysis.memorability * 100).toFixed(1)}%`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Persuasiveness"
                              secondary={`${(metaphor.analysis.persuasiveness * 100).toFixed(1)}%`}
                            />
                          </ListItem>
                        </List>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                          Historical Examples:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {metaphor.examples.map((example) => (
                            <Chip
                              key={example}
                              label={example}
                              size="small"
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