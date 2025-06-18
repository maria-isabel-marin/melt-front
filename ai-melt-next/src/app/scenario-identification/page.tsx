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
} from '@mui/material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface Scenario {
  id: string;
  title: string;
  description: string;
  confidence: number;
  keywords: string[];
}

export default function ScenarioIdentification() {
  const [text, setText] = useState('');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      // TODO: Implement scenario analysis logic
      // This is a mock implementation
      const mockScenarios: Scenario[] = [
        {
          id: '1',
          title: 'Economic Crisis',
          description: 'A scenario involving financial instability and market collapse',
          confidence: 0.92,
          keywords: ['economy', 'crisis', 'financial', 'market'],
        },
        {
          id: '2',
          title: 'Political Transition',
          description: 'A scenario involving changes in political leadership and governance',
          confidence: 0.85,
          keywords: ['politics', 'leadership', 'governance', 'transition'],
        },
      ];
      setScenarios(mockScenarios);
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
          Scenario Identification
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
                placeholder="Enter text to analyze for scenarios..."
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

          {scenarios.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Identified Scenarios
                </Typography>
                <List>
                  {scenarios.map((scenario) => (
                    <ListItem key={scenario.id}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">{scenario.title}</Typography>
                            <Chip
                              label={`${(scenario.confidence * 100).toFixed(1)}% confidence`}
                              size="small"
                              color="primary"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {scenario.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {scenario.keywords.map((keyword) => (
                                <Chip
                                  key={keyword}
                                  label={keyword}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </DashboardLayout>
  );
} 