import { Component, Input, Output, EventEmitter, OnInit, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnalysisService } from '../../../core/services/analysis.service';
import type { PrimaryMetaphor, LevelStatus, ItemStatus } from '../../../core/models/models';

@Component({
  selector: 'app-level1',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './level1.html',
  styleUrl: './level1.scss',
})
export class Level1Component implements OnInit, OnChanges {
  @Input() analysisId!: string;
  @Input() status!: LevelStatus;
  @Output() statusChanged = new EventEmitter<void>();

  metaphors = signal<PrimaryMetaphor[]>([]);
  loading = signal(false);

  constructor(private analysisService: AnalysisService) {}

  ngOnInit() { this.loadResults(); }
  ngOnChanges() { this.loadResults(); }

  loadResults() {
    if (!this.analysisId || this.status === 'PENDING') return;
    this.loading.set(true);
    this.analysisService.getLevel1(this.analysisId).subscribe({
      next: (data) => { this.metaphors.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setItemStatus(metaphorId: string, status: ItemStatus) {
    this.analysisService.updateItemStatus('primaryMetaphor', metaphorId, status).subscribe({
      next: () => this.loadResults(),
    });
  }

  statusIcon(status: ItemStatus): string {
    if (status === 'APPROVED') return 'check_circle';
    if (status === 'REJECTED') return 'cancel';
    return 'radio_button_unchecked';
  }
}
