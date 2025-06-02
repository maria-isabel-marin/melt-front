import { Component }                  from '@angular/core';
import { CommonModule }               from '@angular/common';
import { RouterModule }               from '@angular/router';
import { MatSidenavModule }           from '@angular/material/sidenav';
import { MatToolbarModule }           from '@angular/material/toolbar';
import { MatListModule }              from '@angular/material/list';
import { MatIconModule }              from '@angular/material/icon';
import { MatButtonModule }            from '@angular/material/button';
import { StageService }   from '../../services/stage.service';

interface Step {
  label: string;
  route: string;
  enabled: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,      // brings in *ngFor, *ngIf, etc.
    RouterModule,      // for <router-outlet> and [routerLink]
    MatSidenavModule,  // <mat-sidenav-container>, <mat-sidenav>
    MatToolbarModule,  // <mat-toolbar>
    MatListModule,     // <mat-nav-list>, <mat-list-item>
    MatIconModule,     // <mat-icon>
    MatButtonModule    // optional if you have <button mat-button> anywhere
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard {
  currentStage: string = 'document-upload';
  constructor(public stageService: StageService) {
    this.stageService.currentStage$.subscribe(stage => {
      this.currentStage = stage;
    });
  }
  steps: Step[] = [
    { label: '1. Upload Document',               route: '/document-upload',         enabled: true  },
    { label: '2. Detect & Classify Metaphors',   route: '/metaphor-identification', enabled: false },
    { label: '3. Identify Scenarios',            route: '/scenario-identification', enabled: false },
    { label: '4. Identify Regimes',              route: '/regime-identification',   enabled: false },
    { label: '5. Rate Regimes',                  route: '/regime-rating',           enabled: false },
    { label: '6. Mobilization Metaphors',        route: '/mobilization-metaphors',  enabled: false }
  ];

  go(step: Step) {
    if (step.enabled) {
      // either use router.navigateByUrl or [routerLink] in template
      window.location.href = step.route; // or inject Router and call navigateByUrl
    }
  }

  // Método auxiliar para comparar la etapa actual y devolver clase CSS
  isActive(stage: string): boolean {
    return this.currentStage === stage;
  }

  /** 
   * Call this from each “finishStep()” in your stage components
   * to unlock the next menu item. 
   */
  unlockNext(currentRoute: string) {
    const idx = this.steps.findIndex(s => s.route === currentRoute);
    if (idx >= 0 && idx < this.steps.length - 1) {
      this.steps[idx + 1].enabled = true;
    }
  }
}
