import { Component, Input, Output, EventEmitter, OnInit, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnalysisService } from '../../../core/services/analysis.service';
import type { MetaphoricalScenario, LevelStatus, ItemStatus } from '../../../core/models/models';

@Component({
  selector: 'app-level3',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule],
  templateUrl: './level3.html',
  styleUrl: './level3.scss',
})
export class Level3Component implements OnInit, OnChanges {
  @Input() analysisId!: string;
  @Input() status!: LevelStatus;
  @Output() statusChanged = new EventEmitter<void>();

  scenarios = signal<MetaphoricalScenario[]>([]);
  loading = signal(false);

  constructor(private analysisService: AnalysisService) {}

  ngOnInit() { this.loadResults(); }
  ngOnChanges() { this.loadResults(); }

  loadResults() {
    if (!this.analysisId || this.status === 'PENDING') return;
    this.loading.set(true);
    this.analysisService.getLevel3(this.analysisId).subscribe({
      next: (data) => { this.scenarios.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setItemStatus(id: string, status: ItemStatus) {
    this.analysisService.updateItemStatus('metaphoricalScenario', id, status).subscribe({
      next: () => this.loadResults(),
    });
  }

  statusColor(status: string): string {
    if (status === 'DOMINANT') return '#1a237e';
    if (status === 'CHALLENGER') return '#e65100';
    if (status === 'EMERGING') return '#2e7d32';
    return '#78909c';
  }
}
