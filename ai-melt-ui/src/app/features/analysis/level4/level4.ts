import { Component, Input, Output, EventEmitter, OnInit, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnalysisService } from '../../../core/services/analysis.service';
import type { MetaphorRegime, LevelStatus, ItemStatus } from '../../../core/models/models';

@Component({
  selector: 'app-level4',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule],
  templateUrl: './level4.html',
  styleUrl: './level4.scss',
})
export class Level4Component implements OnInit, OnChanges {
  @Input() analysisId!: string;
  @Input() status!: LevelStatus;
  @Output() statusChanged = new EventEmitter<void>();

  regimes = signal<MetaphorRegime[]>([]);
  loading = signal(false);

  constructor(private analysisService: AnalysisService) {}

  ngOnInit() { this.loadResults(); }
  ngOnChanges() { this.loadResults(); }

  loadResults() {
    if (!this.analysisId || this.status === 'PENDING') return;
    this.loading.set(true);
    this.analysisService.getLevel4(this.analysisId).subscribe({
      next: (data) => { this.regimes.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setItemStatus(id: string, status: ItemStatus) {
    this.analysisService.updateItemStatus('metaphorRegime', id, status).subscribe({
      next: () => this.loadResults(),
    });
  }
}
