import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentService } from '../../../core/services/document.service';
import { AnalysisService } from '../../../core/services/analysis.service';
import { Level1Component } from '../level1/level1';
import { Level2Component } from '../level2/level2';
import { Level3Component } from '../level3/level3';
import { Level4Component } from '../level4/level4';
import { Level5Component } from '../level5/level5';
import type { Document, Analysis, AiProvider, LevelStatus } from '../../../core/models/models';

@Component({
  selector: 'app-document-analysis',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    Level1Component,
    Level2Component,
    Level3Component,
    Level4Component,
    Level5Component,
  ],
  templateUrl: './document-analysis.html',
  styleUrl: './document-analysis.scss',
})
export class DocumentAnalysisComponent implements OnInit {
  document = signal<Document | null>(null);
  analysis = signal<Analysis | null>(null);
  loading = signal(true);
  selectedProvider: AiProvider = 'CLAUDE';

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private analysisService: AnalysisService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() {
    const docId = this.route.snapshot.paramMap.get('docId')!;
    this.documentService.getOne(docId).subscribe({
      next: (doc) => {
        this.document.set(doc as any);
        if ((doc as any).analysis) {
          this.analysis.set((doc as any).analysis);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  startAnalysis() {
    const docId = this.document()!.id;
    this.documentService.initAnalysis(docId, this.selectedProvider).subscribe({
      next: (a) => {
        this.analysis.set(a);
        this.snack.open('Analysis initialized', '', { duration: 3000 });
      },
    });
  }

  processLevel(level: 1 | 2 | 3 | 4 | 5) {
    const analysisId = this.analysis()!.id;
    this.snack.open(`Running Level ${level}…`, '', { duration: 2000 });
    this.analysisService.processLevel(analysisId, level).subscribe({
      next: () => this.refreshAnalysis(),
      error: (e) => this.snack.open(`Error: ${e.message ?? 'unknown'}`, 'Close', { duration: 5000 }),
    });
  }

  approveAllItems(level: 1 | 2 | 3 | 4 | 5) {
    const analysisId = this.analysis()!.id;
    this.analysisService.approveAllItems(analysisId, level).subscribe({
      next: (updated) => { this.analysis.set(updated); this.snack.open(`Level ${level} approved`, '', { duration: 3000 }); },
    });
  }

  refreshAnalysis() {
    const analysisId = this.analysis()?.id;
    if (!analysisId) return;
    this.analysisService.getAnalysis(analysisId).subscribe({
      next: (a) => this.analysis.set(a),
    });
  }

  levelStatus(level: 1 | 2 | 3 | 4 | 5): LevelStatus {
    const a = this.analysis();
    if (!a) return 'PENDING';
    const map: Record<number, LevelStatus> = {
      1: a.level1Status, 2: a.level2Status, 3: a.level3Status, 4: a.level4Status, 5: a.level5Status,
    };
    return map[level];
  }

  canProcess(level: 1 | 2 | 3 | 4 | 5): boolean {
    if (!this.analysis()) return false;
    const s = this.levelStatus(level);
    if (s === 'PROCESSING') return false;
    if (level === 1) return true;
    return this.levelStatus((level - 1) as any) === 'APPROVED';
  }

  corpusId(): string {
    return this.route.snapshot.paramMap.get('corpusId')!;
  }
}
