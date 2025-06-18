'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useStageService } from '@/lib/hooks/useStageService';

export default function DocumentUpload() {
  const {
    processingCode,
    generateProcessingCode,
    setBatches,
    setPromptTokens,
    getPromptTokens,
  } = useStageService();

  const [files, setFiles] = useState<File[]>([]);
  const [promptTokens, setPromptTokensLocal] = useState(getPromptTokens());
  const [batchTokens, setBatchTokens] = useState(1000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Generar código de procesamiento al montar el componente
  useEffect(() => {
    if (!processingCode) {
      generateProcessingCode();
    }
  }, [processingCode, generateProcessingCode]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleFileDelete = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const processTextIntoBatches = (text: string, batchSize: number): string[] => {
    const words = text.split(/\s+/);
    const batches: string[] = [];
    
    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize).join(' ');
      if (batch.trim()) {
        batches.push(batch);
      }
    }
    
    return batches;
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Por favor selecciona al menos un archivo');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      let allText = '';
      
      // Leer todos los archivos
      for (const file of files) {
        try {
          const text = await readFileAsText(file);
          allText += text + '\n\n';
        } catch (err) {
          console.error(`Error leyendo archivo ${file.name}:`, err);
          setError(`Error leyendo archivo ${file.name}`);
          return;
        }
      }

      // Procesar texto en batches
      const batches = processTextIntoBatches(allText, batchTokens);
      
      if (batches.length === 0) {
        setError('No se pudo generar ningún batch del texto');
        return;
      }

      // Guardar en el servicio global
      setBatches(batches);
      setPromptTokens(promptTokens);

      setSuccess(`Archivos procesados exitosamente. Se generaron ${batches.length} batches.`);
      
      // Limpiar archivos
      setFiles([]);

    } catch (err) {
      console.error('Error procesando archivos:', err);
      setError('Error procesando los archivos');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Document Upload
        </Typography>

        <Grid container spacing={3}>
          {/* Configuración */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Configuration
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Processing Code: {processingCode}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Prompt Tokens"
                type="number"
                value={promptTokens}
                onChange={(e) => setPromptTokensLocal(Number(e.target.value))}
                sx={{ mb: 2 }}
                helperText="Número de tokens por prompt"
              />

              <TextField
                fullWidth
                label="Batch Tokens"
                type="number"
                value={batchTokens}
                onChange={(e) => setBatchTokens(Number(e.target.value))}
                sx={{ mb: 2 }}
                helperText="Número de tokens por batch"
              />
            </Paper>
          </Grid>

          {/* Carga de archivos */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                File Upload
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <input
                  accept=".doc,.docx,.pdf,.txt"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                />
                <label htmlFor="raised-button-file">
                  <Button variant="contained" component="span">
                    Select Files
                  </Button>
                </label>
              </Box>

              {files.length > 0 && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Selected Files ({files.length})
                  </Typography>
                  <List dense>
                    {files.map((file, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024).toFixed(2)} KB`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleFileDelete(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    disabled={files.length === 0 || isProcessing}
                    startIcon={isProcessing ? <CircularProgress size={20} /> : null}
                    fullWidth
                  >
                    {isProcessing ? 'Processing...' : 'Process Files'}
                  </Button>
                </>
              )}
            </Paper>
          </Grid>

          {/* Mensajes de estado */}
          {error && (
            <Grid item xs={12}>
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </Grid>
          )}

          {success && (
            <Grid item xs={12}>
              <Alert severity="success" onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            </Grid>
          )}
        </Grid>
      </Container>
    </DashboardLayout>
  );
} 