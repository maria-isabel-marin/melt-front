import { Component, Input, Output, EventEmitter, OnInit, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnalysisService } from '../../../core/services/analysis.service';
import type { ConventionalMetaphor, LevelStatus, ItemStatus } from '../../../core/models/models';

@Component({
  selector: 'app-level2',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './level2.html',
  styleUrl: './level2.scss',
})
export class Level2Component implements OnInit, OnChanges {
  @Input() analysisId!: string;
  @Input() status!: LevelStatus;
  @Output() statusChanged = new EventEmitter<void>();

  metaphors = signal<ConventionalMetaphor[]>([]);
  loading = signal(false);

  constructor(private analysisService: AnalysisService) {}

  ngOnInit() { this.loadResults(); }
  ngOnChanges() { this.loadResults(); }

  loadResults() {
    if (!this.analysisId || this.status === 'PENDING') return;
    this.loading.set(true);
    this.analysisService.getLevel2(this.analysisId).subscribe({
      next: (data) => { this.metaphors.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setItemStatus(id: string, status: ItemStatus) {
    this.analysisService.updateItemStatus('conventionalMetaphor', id, status).subscribe({
      next: () => this.loadResults(),
    });
  }

  robustnessColor(r: string): string {
    if (r === 'HIGH') return '#2e7d32';
    if (r === 'MODERATE') return '#f57f17';
    return '#c62828';
  }
}
