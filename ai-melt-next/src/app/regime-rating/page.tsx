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
  Rating,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface RegimeRating {
  id: string;
  name: string;
  description: string;
  overallScore: number;
  criteria: {
    name: string;
    score: number;
    weight: number;
  }[];
}

export default function RegimeRatingPage() {
  const [text, setText] = useState('');
  const [ratings, setRatings] = useState<RegimeRating[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRegime, setSelectedRegime] = useState<string>('');

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      // TODO: Implement regime rating analysis logic
      // This is a mock implementation
      const mockRatings: RegimeRating[] = [
        {
          id: '1',
          name: 'Democratic Regime',
          description: 'A political system characterized by free and fair elections',
          overallScore: 4.5,
          criteria: [
            { name: 'Political Freedom', score: 4.8, weight: 0.3 },
            { name: 'Civil Liberties', score: 4.5, weight: 0.3 },
            { name: 'Rule of Law', score: 4.2, weight: 0.2 },
            { name: 'Economic Freedom', score: 4.0, weight: 0.2 },
          ],
        },
        {
          id: '2',
          name: 'Authoritarian Regime',
          description: 'A political system characterized by centralized power',
          overallScore: 2.3,
          criteria: [
            { name: 'Political Freedom', score: 1.5, weight: 0.3 },
            { name: 'Civil Liberties', score: 1.8, weight: 0.3 },
            { name: 'Rule of Law', score: 2.5, weight: 0.2 },
            { name: 'Economic Freedom', score: 3.5, weight: 0.2 },
          ],
        },
      ];
      setRatings(mockRatings);
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRegimeSelect = (regimeId: string) => {
    setSelectedRegime(regimeId);
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Regime Rating
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
                placeholder="Enter text to analyze and rate regimes..."
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

          {ratings.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Regime Ratings
              </Typography>
              <Grid container spacing={3}>
                {ratings.map((rating) => (
                  <Grid item xs={12} md={6} key={rating.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Typography variant="h6">{rating.name}</Typography>
                          <Rating
                            value={rating.overallScore}
                            precision={0.1}
                            readOnly
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {rating.description}
                        </Typography>
                        <Typography variant="subtitle2" gutterBottom>
                          Rating Criteria:
                        </Typography>
                        {rating.criteria.map((criterion) => (
                          <Box key={criterion.name} sx={{ mb: 2 }}>
                            <Typography variant="body2" gutterBottom>
                              {criterion.name} (Weight: {criterion.weight * 100}%)
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Slider
                                value={criterion.score}
                                min={0}
                                max={5}
                                step={0.1}
                                disabled
                                sx={{ flexGrow: 1 }}
                              />
                              <Typography variant="body2" sx={{ minWidth: 40 }}>
                                {criterion.score.toFixed(1)}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
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