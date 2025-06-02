import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StageService, UploadResult } from '../../services/stage.service';

@Component({
  selector: 'app-metaphor-identification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metaphor-identification.html',
  styleUrls: ['./metaphor-identification.scss']
})
export class MetaphorIdentification {
  public batches: string[] = [];
  public promptTokens: number = 0;

  constructor(private stageService: StageService) {
    this.stageService.data$.subscribe((data: UploadResult | null) => {
      if (data) {
        this.batches = data.batches;
        this.promptTokens = data.promptTokens;
      }
    });
  }
}
