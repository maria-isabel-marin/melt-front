import { Component, Input, Output, EventEmitter, OnInit, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnalysisService } from '../../../core/services/analysis.service';
import type { CulturalNarrative, LevelStatus, ItemStatus } from '../../../core/models/models';

@Component({
  selector: 'app-level5',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './level5.html',
  styleUrl: './level5.scss',
})
export class Level5Component implements OnInit, OnChanges {
  @Input() analysisId!: string;
  @Input() status!: LevelStatus;
  @Output() statusChanged = new EventEmitter<void>();

  narrative = signal<CulturalNarrative | null>(null);
  loading = signal(false);

  constructor(private analysisService: AnalysisService) {}

  ngOnInit() { this.loadResults(); }
  ngOnChanges() { this.loadResults(); }

  loadResults() {
    if (!this.analysisId || this.status === 'PENDING') return;
    this.loading.set(true);
    this.analysisService.getLevel5(this.analysisId).subscribe({
      next: (data) => { this.narrative.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setItemStatus(id: string, status: ItemStatus) {
    this.analysisService.updateItemStatus('culturalNarrative', id, status).subscribe({
      next: () => this.loadResults(),
    });
  }
}
