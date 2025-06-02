import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { StageService } from '../../services/stage.service';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './document-upload.html',
  styleUrls: ['./document-upload.scss']
})
export class DocumentUpload {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  /** Formulario reactivo para los valores: promptTokens y batchTokens */
  form: FormGroup;

  /** Nombre del archivo seleccionado */
  selectedFileName: string = '';

  /** Contenido completo del archivo */
  fileContent: string = '';

  /** Array de “batches”: cada elemento es un string con un fragmento del texto */
  batches: string[] = [];

  /** Progreso (0..100) para la barra */
  progressValue = 0;

  /** Mensaje de estado (éxito o error) */
  statusMessage: string = '';
  /** Indica si hubo error en procesamiento */
  isError: boolean = false;

  constructor(
    private fb: FormBuilder,
    private stageService: StageService
  ) {
    // Inicializamos el form; validamos rangos y “prompt <= batch”
    this.form = this.fb.group({
      promptTokens: [100, [Validators.required, Validators.min(100), Validators.max(500)]],
      batchTokens: [1000, [Validators.required, Validators.min(1000), Validators.max(3000)]]
    }, { validators: [this.promptLessThanOrEqualBatch] });
    this.stageService.setData({
    batches: this.batches,
    promptTokens: this.form.get('promptTokens')!.value
});
  }

  /** Validador custom: promptTokens ≤ batchTokens */
  promptLessThanOrEqualBatch(group: FormGroup) {
    const prompt = group.get('promptTokens')!.value;
    const batch = group.get('batchTokens')!.value;
    return (prompt <= batch) ? null : { promptGreaterThanBatch: true };
  }

  /** Dispara el <input type="file"> al hacer clic en “Seleccionar” */
  onSelectFileClick() {
    this.fileInputRef.nativeElement.click();
  }

  /** Evento cuando el usuario elige un archivo */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFileName = file.name;
      // Ya no leemos aquí; esperamos a presionar “Procesar”
    }
  }

  /** Hacer “reset” del input file si se desea eliminarlo */
  clearFileSelection() {
    this.fileInputRef.nativeElement.value = '';
    this.selectedFileName = '';
  }

  /** Getter para saber si hay un archivo “listo” en el input */
  get hasFileSelected(): boolean {
    // Si fileInputRef existe Y files[] existe Y files.length > 0 => true
    return !!(
      this.fileInputRef &&
      this.fileInputRef.nativeElement &&
      this.fileInputRef.nativeElement.files &&
      this.fileInputRef.nativeElement.files.length > 0
    );
  }

  /** Procesa el archivo: lee su contenido, lo divide en batches y actualiza la barra de progreso */
  onProcess() {
    // Reiniciar estado
    this.progressValue = 0;
    this.batches = [];
    this.fileContent = '';
    this.statusMessage = '';
    this.isError = false;

    // Validar que haya seleccionado archivo y formulario válido
    if (!this.fileInputRef.nativeElement.files?.length) {
      this.isError = true;
      this.statusMessage = 'No file selected.';
      return;
    }
    if (this.form.invalid) {
      this.isError = true;
      this.statusMessage = 'Configuration invalid. Please check token values.';
      return;
    }

    const file = this.fileInputRef.nativeElement.files![0];
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = reader.result as string;
        this.fileContent = text;

        // Convertir el texto completo en array de “tokens” (por sencillez, 
        // separamos por espacios en blanco; asume que cada “palabra” es un token)
        const allTokens = text.split(/\s+/).filter(t => t.length > 0);

        const batchSize = this.form.get('batchTokens')!.value as number;
        const totalBatches = Math.ceil(allTokens.length / batchSize);

        // Dividimos en batches
        for (let i = 0; i < totalBatches; i++) {
          const start = i * batchSize;
          const end = start + batchSize;
          const sliceTokens = allTokens.slice(start, end);
          const sliceText = sliceTokens.join(' ');
          this.batches.push(sliceText);

          // Actualizar progreso
          this.progressValue = Math.round(((i + 1) / totalBatches) * 100);
        }

        // Si llegamos aquí, todo OK
        this.isError = false;
        this.statusMessage = 'File loaded successfully. You may proceed to the next MELT step.';
        
        // Notificar al StageService que ahora activamos “metaphor-identification”
        this.stageService.setStage('metaphor-identification');
      }
      catch (err: any) {
        this.isError = true;
        this.statusMessage = `The text could not be processed, error: ${err.message || err.toString()}`;
      }
    };

    reader.onerror = (e) => {
      this.isError = true;
      this.statusMessage = `FileReader error: ${reader.error?.message || 'Unknown error'}`;
    };

    // Iniciar la lectura
    reader.readAsText(file);
  }

  /** Helper para mostrar errores de validación en el template */
  get promptTokensControl() {
    return this.form.get('promptTokens');
  }
  get batchTokensControl() {
    return this.form.get('batchTokens');
  }
  
}

