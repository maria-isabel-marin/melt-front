import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule }      from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatProgressBarModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './document-upload.html',
  styleUrls: ['./document-upload.scss']
})
export class DocumentUpload {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  form: FormGroup;
  selectedFileName = '';
  fileContent = '';
  batches: string[] = [];
  progressValue = 0;
  statusMessage = '';
  isError = false;

  /** Mostramos el processingCode generado en DocumentUpload para que el usuario lo copie. */
  processingCode: string = '';

  constructor(
    private fb: FormBuilder,
    private stageService: StageService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      promptTokens: [100, [Validators.required, Validators.min(100), Validators.max(500)]],
      batchTokens: [1000, [Validators.required, Validators.min(1000), Validators.max(3000)]]
    }, { validators: [this.promptLessThanOrEqualBatch] });
  }

  promptLessThanOrEqualBatch(group: FormGroup) {
    const prompt = group.get('promptTokens')!.value;
    const batch = group.get('batchTokens')!.value;
    return (prompt <= batch) ? null : { promptGreaterThanBatch: true };
  }

  onSelectFileClick() {
    this.fileInputRef.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFileName = input.files[0].name;
    }
  }

  get hasFileSelected(): boolean {
    return !!(
      this.fileInputRef &&
      this.fileInputRef.nativeElement &&
      this.fileInputRef.nativeElement.files &&
      this.fileInputRef.nativeElement.files.length > 0
    );
  }

  onProcess() {
    this.progressValue = 0;
    this.batches = [];
    this.fileContent = '';
    this.statusMessage = '';
    this.isError = false;

    if (!this.hasFileSelected) {
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
        const allTokens = text.split(/\s+/).filter(t => t.length > 0);
        const batchSize = this.form.get('batchTokens')!.value as number;
        const totalBatches = Math.ceil(allTokens.length / batchSize);

        for (let i = 0; i < totalBatches; i++) {
          const start = i * batchSize;
          const end = start + batchSize;
          const sliceTokens = allTokens.slice(start, end);
          const sliceText = sliceTokens.join(' ');
          this.batches.push(sliceText);
          this.progressValue = Math.round(((i + 1) / totalBatches) * 100);
        }

        this.stageService.setBatches(this.batches);
        this.stageService.setPromptTokens(this.form.get('promptTokens')!.value);

        this.isError = false;

        // 1) Generar el processing code aquí:
        this.processingCode = this.stageService.generateProcessingCode();

        // 2) Cambiar etapa y “alertar” al usuario:
        this.stageService.setStage('metaphor-identification');

        this.snackBar.open(
          `File loaded. Processing Code: ${this.processingCode}`, 
          'Close', { duration: 5000 }
        );
      }
      catch (err: any) {
        this.isError = true;
        this.statusMessage = `Text could not be processed, error: ${err.message || err.toString()}`;
      }
    };

    reader.onerror = () => {
      this.isError = true;
      this.statusMessage = `FileReader error: ${reader.error?.message || 'Unknown error'}`;
    };
    reader.readAsText(file);
  }

  /** Este es el método que faltaba: copia texto al portapapeles */
  copyToClipboard(value: string) {
    if (!value) {
      return;
    }
    navigator.clipboard.writeText(value).then(
      () => {
        this.snackBar.open('Processing code copied to clipboard.', 'OK', { duration: 2000 });
      },
      (err) => {
        this.snackBar.open(`Failed to copy: ${err}`, 'OK', { duration: 3000 });
      }
    );
  }

  get promptTokensControl() {
    return this.form.get('promptTokens');
  }
  get batchTokensControl() {
    return this.form.get('batchTokens');
  }
}
