import { Component } from '@angular/core';
import { Dashboard } from '../dashboard/dashboard';

@Component({
  selector: 'app-regime-identification',
  standalone: true,
  imports: [],
  templateUrl: './regime-identification.html',
  styleUrl: './regime-identification.scss'
})
export class RegimeIdentification {
constructor(private dashboard: Dashboard) {}

  onComplete() {
    // upload logic…
    this.dashboard.unlockNext('/regime-identification');
    // navigate to next or show success
  }
}
