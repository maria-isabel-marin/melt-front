import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CorpusService } from '../../../core/services/corpus.service';

@Component({
  selector: 'app-create-corpus-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './create-corpus-dialog.html',
})
export class CreateCorpusDialogComponent {
  form: ReturnType<FormBuilder['group']>;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private corpusService: CorpusService,
    private dialogRef: MatDialogRef<CreateCorpusDialogComponent>,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      discursiveCommunity: [''],
      textualGenre: [''],
    });
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    this.corpusService.create(this.form.value as any).subscribe({
      next: (corpus) => { this.saving = false; this.dialogRef.close(corpus); },
      error: () => { this.saving = false; },
    });
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
