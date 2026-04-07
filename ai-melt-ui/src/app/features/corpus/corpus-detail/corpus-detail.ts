import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { CorpusService } from '../../../core/services/corpus.service';
import { DocumentService } from '../../../core/services/document.service';
import { CreateDocumentDialogComponent } from '../create-document-dialog/create-document-dialog';
import type { Corpus, DocumentSummary, LevelStatus } from '../../../core/models/models';

@Component({
  selector: 'app-corpus-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTableModule,
  ],
  templateUrl: './corpus-detail.html',
  styleUrl: './corpus-detail.scss',
})
export class CorpusDetailComponent implements OnInit {
  corpus = signal<Corpus | null>(null);
  loading = signal(true);

  displayedColumns = ['title', 'language', 'type', 'status', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private corpusService: CorpusService,
    private documentService: DocumentService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadCorpus(id);
  }

  loadCorpus(id: string) {
    this.loading.set(true);
    this.corpusService.getOne(id).subscribe({
      next: (c) => { this.corpus.set(c); this.loading.set(false); },
      error: () => { this.loading.set(false); this.router.navigate(['/corpus']); },
    });
  }

  openAddDocument() {
    const ref = this.dialog.open(CreateDocumentDialogComponent, {
      width: '480px',
      data: { corpusId: this.corpus()!.id },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadCorpus(this.corpus()!.id);
    });
  }

  openDocument(doc: DocumentSummary) {
    this.router.navigate(['/corpus', this.corpus()!.id, 'document', doc.id]);
  }

  deleteDocument(doc: DocumentSummary, event: Event) {
    event.stopPropagation();
    if (!confirm(`Delete document "${doc.title}"?`)) return;
    this.documentService.delete(doc.id).subscribe({
      next: () => {
        this.snack.open('Document deleted', '', { duration: 3000 });
        this.loadCorpus(this.corpus()!.id);
      },
    });
  }

  overallStatus(doc: DocumentSummary): LevelStatus {
    const a = doc.analysis;
    if (!a) return 'PENDING';
    const levels: LevelStatus[] = [a.level1Status, a.level2Status, a.level3Status, a.level4Status, a.level5Status];
    if (levels.every((s) => s === 'APPROVED')) return 'APPROVED';
    if (levels.some((s) => s === 'PROCESSING')) return 'PROCESSING';
    if (levels.some((s) => s === 'PENDING_REVIEW')) return 'PENDING_REVIEW';
    if (levels.some((s) => s === 'OUTDATED')) return 'OUTDATED';
    return 'PENDING';
  }

  documentTypeLabel(type: string | undefined): string {
    if (!type) return '—';
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
