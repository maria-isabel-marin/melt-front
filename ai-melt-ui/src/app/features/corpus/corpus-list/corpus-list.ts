import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CorpusService } from '../../../core/services/corpus.service';
import { CreateCorpusDialogComponent } from '../create-corpus-dialog/create-corpus-dialog';
import type { Corpus } from '../../../core/models/models';

@Component({
  selector: 'app-corpus-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatSnackBarModule,
  ],
  templateUrl: './corpus-list.html',
  styleUrl: './corpus-list.scss',
})
export class CorpusListComponent implements OnInit {
  corpora = signal<Corpus[]>([]);
  loading = signal(true);

  constructor(
    private corpusService: CorpusService,
    private dialog: MatDialog,
    private router: Router,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadCorpora();
  }

  loadCorpora() {
    this.loading.set(true);
    this.corpusService.getAll().subscribe({
      next: (data) => { this.corpora.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  openCreateDialog() {
    const ref = this.dialog.open(CreateCorpusDialogComponent, { width: '480px' });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadCorpora();
    });
  }

  openCorpus(id: string) {
    this.router.navigate(['/corpus', id]);
  }

  deleteCorpus(corpus: Corpus, event: Event) {
    event.stopPropagation();
    if (!confirm(`Delete corpus "${corpus.name}"? This cannot be undone.`)) return;
    this.corpusService.delete(corpus.id).subscribe({
      next: () => { this.snack.open('Corpus deleted', '', { duration: 3000 }); this.loadCorpora(); },
    });
  }

  documentCount(corpus: Corpus): number {
    return corpus._count?.documents ?? 0;
  }
}
