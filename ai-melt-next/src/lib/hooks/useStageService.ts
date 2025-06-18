import { useState, useEffect } from 'react';
import { stageService } from '../services/stageService';
import { Metaphor } from '../services/metaphorService';

export function useStageService() {
  const [processingCode, setProcessingCode] = useState(stageService.getProcessingCode());
  const [currentStage, setCurrentStage] = useState(stageService.getCurrentStage());
  const [confirmedMetaphors, setConfirmedMetaphors] = useState<Metaphor[]>(stageService.getConfirmedMetaphors());

  useEffect(() => {
    // Suscribirse a cambios de processingCode
    const unsubscribeProcessingCode = stageService.subscribe('processingCode', (code: string) => {
      setProcessingCode(code);
    });

    // Suscribirse a cambios de currentStage
    const unsubscribeCurrentStage = stageService.subscribe('currentStage', (stage: string) => {
      setCurrentStage(stage);
    });

    // Suscribirse a cambios de confirmedMetaphors
    const unsubscribeConfirmedMetaphors = stageService.subscribe('confirmedMetaphors', (metaphors: Metaphor[]) => {
      setConfirmedMetaphors(metaphors);
    });

    // Cleanup function
    return () => {
      unsubscribeProcessingCode();
      unsubscribeCurrentStage();
      unsubscribeConfirmedMetaphors();
    };
  }, []);

  return {
    // Estado
    processingCode,
    currentStage,
    confirmedMetaphors,
    
    // Métodos
    generateProcessingCode: stageService.generateProcessingCode.bind(stageService),
    setProcessingCode: stageService.setProcessingCode.bind(stageService),
    getProcessingCode: stageService.getProcessingCode.bind(stageService),
    setStage: stageService.setStage.bind(stageService),
    getCurrentStage: stageService.getCurrentStage.bind(stageService),
    appendConfirmed: stageService.appendConfirmed.bind(stageService),
    clearConfirmedMetaphors: stageService.clearConfirmedMetaphors.bind(stageService),
    getConfirmedMetaphors: stageService.getConfirmedMetaphors.bind(stageService),
    getBatches: stageService.getBatches.bind(stageService),
    setBatches: stageService.setBatches.bind(stageService),
    addBatch: stageService.addBatch.bind(stageService),
    clearBatches: stageService.clearBatches.bind(stageService),
    setPromptTokens: stageService.setPromptTokens.bind(stageService),
    getPromptTokens: stageService.getPromptTokens.bind(stageService),
    getPipelineState: stageService.getPipelineState.bind(stageService),
  };
} 