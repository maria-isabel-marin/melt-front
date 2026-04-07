import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentService } from '../../../core/services/document.service';

@Component({
  selector: 'app-create-document-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './create-document-dialog.html',
})
export class CreateDocumentDialogComponent {
  form: ReturnType<FormBuilder['group']>;
  saving = false;

  documentTypes = [
    { value: 'ACADEMIC_ARTICLE', label: 'Academic Article' },
    { value: 'POLITICAL_SPEECH', label: 'Political Speech' },
    { value: 'NEWS', label: 'News' },
    { value: 'EDITORIAL', label: 'Editorial' },
    { value: 'INTERVIEW', label: 'Interview' },
    { value: 'OFFICIAL_DOCUMENT', label: 'Official Document' },
    { value: 'SOCIAL_MEDIA', label: 'Social Media' },
    { value: 'OTHER', label: 'Other' },
  ];

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private dialogRef: MatDialogRef<CreateDocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { corpusId: string },
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      author: [''],
      language: ['SPANISH', Validators.required],
      documentType: [''],
      pageCount: [null],
    });
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const payload = { ...this.form.value, corpusId: this.data.corpusId } as any;
    if (!payload.documentType) delete payload.documentType;
    if (!payload.pageCount) delete payload.pageCount;

    this.documentService.create(payload).subscribe({
      next: (doc) => { this.saving = false; this.dialogRef.close(doc); },
      error: () => { this.saving = false; },
    });
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
