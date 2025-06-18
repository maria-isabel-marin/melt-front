'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TablePagination,
  LinearProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useStageService } from '@/lib/hooks/useStageService';
import { metaphorService, Metaphor, ProcessBatchRequest } from '@/lib/services/metaphorService';

export default function MetaphorIdentification() {
  const {
    processingCode,
    getBatches,
    getPromptTokens,
    appendConfirmed,
  } = useStageService();

  const [batches, setBatches] = useState<string[]>([]);
  const [metaphorsByPage, setMetaphorsByPage] = useState<Metaphor[][]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedMetaphors, setSelectedMetaphors] = useState<Set<string>>(new Set());
  const [batchProgressValue, setBatchProgressValue] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar batches al montar el componente
  useEffect(() => {
    const loadedBatches = getBatches();
    setBatches(loadedBatches);
  }, [getBatches]);

  const handleProcessCurrentBatch = async () => {
    if (batches.length === 0) {
      return;
    }

    setIsProcessing(true);
    setBatchProgressValue(0);
    setSelectedMetaphors(new Set());
    setError(null);

    // Construimos el body para la petición POST
    const body: ProcessBatchRequest = {
      processing_code: processingCode,
      batch_index: currentPageIndex,
      batch_text: batches[currentPageIndex],
      prompt_tokens: getPromptTokens()
    };

    try {
      // Simular progreso mientras se procesa
      const progressInterval = setInterval(() => {
        setBatchProgressValue(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 2;
        });
      }, 50);

      // Llamada real al servicio
      const metaphors = await metaphorService.processBatch(body);
      
      clearInterval(progressInterval);
      setBatchProgressValue(100);

      // Guardar en el arreglo global paginado
      const newMetaphorsByPage = [...metaphorsByPage];
      newMetaphorsByPage[currentPageIndex] = metaphors;
      setMetaphorsByPage(newMetaphorsByPage);

    } catch (err: any) {
      console.error('[MetaphorIdentification] Error del servicio:', err);
      setError(err.response?.data?.detail || err.message || 'Error procesando el batch');
    } finally {
      setIsProcessing(false);
      setBatchProgressValue(0);
    }
  };

  const handleAcceptSelection = () => {
    const currentMetaphors = metaphorsByPage[currentPageIndex] || [];
    
    // Marcar como confirmadas solo las seleccionadas
    const confirmedMetaphors = currentMetaphors.filter((_, index) => 
      selectedMetaphors.has(index.toString())
    ).map(metaphor => ({
      ...metaphor,
      confirmed: true
    }));

    // Agregar a la lista global
    appendConfirmed(confirmedMetaphors);

    // Limpiar selección
    setSelectedMetaphors(new Set());

    // Mostrar mensaje de éxito
    setError(null);
  };

  const handleSelectMetaphor = (index: number) => {
    const newSelected = new Set(selectedMetaphors);
    const indexStr = index.toString();
    
    if (newSelected.has(indexStr)) {
      newSelected.delete(indexStr);
    } else {
      newSelected.add(indexStr);
    }
    
    setSelectedMetaphors(newSelected);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setCurrentPageIndex(newPage);
    setSelectedMetaphors(new Set());
  };

  const currentMetaphors = metaphorsByPage[currentPageIndex] || [];
  const totalPages = batches.length;

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Metaphor Identification
        </Typography>

        {batches.length === 0 ? (
          <Alert severity="info">
            No hay batches disponibles. Por favor, sube documentos primero.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {/* Información del batch actual */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Batch {currentPageIndex + 1} de {totalPages}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Processing Code: {processingCode}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Prompt Tokens: {getPromptTokens()}
                </Typography>
                
                {isProcessing && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={batchProgressValue} 
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Procesando batch... {batchProgressValue}%
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleProcessCurrentBatch}
                    disabled={isProcessing}
                    startIcon={isProcessing ? <CircularProgress size={20} /> : null}
                  >
                    {isProcessing ? 'Procesando...' : 'Process Current Batch'}
                  </Button>
                  
                  {currentMetaphors.length > 0 && selectedMetaphors.size > 0 && (
                    <Button
                      variant="outlined"
                      onClick={handleAcceptSelection}
                    >
                      Accept Selected ({selectedMetaphors.size})
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Tabla de metáforas */}
            {currentMetaphors.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Identified Metaphors
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <Checkbox
                              indeterminate={selectedMetaphors.size > 0 && selectedMetaphors.size < currentMetaphors.length}
                              checked={selectedMetaphors.size === currentMetaphors.length}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  setSelectedMetaphors(new Set(currentMetaphors.map((_, index) => index.toString())));
                                } else {
                                  setSelectedMetaphors(new Set());
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>Expression</TableCell>
                          <TableCell>Source Domain</TableCell>
                          <TableCell>Target Domain</TableCell>
                          <TableCell>Conceptual Metaphor</TableCell>
                          <TableCell>Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentMetaphors.map((metaphor, index) => (
                          <TableRow key={index}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedMetaphors.has(index.toString())}
                                onChange={() => handleSelectMetaphor(index)}
                              />
                            </TableCell>
                            <TableCell>{metaphor.expression}</TableCell>
                            <TableCell>{metaphor.sourceDomain}</TableCell>
                            <TableCell>{metaphor.targetDomain}</TableCell>
                            <TableCell>{metaphor.conceptualMetaphor}</TableCell>
                            <TableCell>{metaphor.type}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <Grid item xs={12}>
                <TablePagination
                  component="div"
                  count={totalPages}
                  page={currentPageIndex}
                  onPageChange={handlePageChange}
                  rowsPerPage={1}
                  rowsPerPageOptions={[1]}
                  labelDisplayedRows={({ from, to, count }) => 
                    `Batch ${from} of ${count}`
                  }
                />
              </Grid>
            )}
          </Grid>
        )}

        {/* Snackbar para errores */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </DashboardLayout>
  );
} 