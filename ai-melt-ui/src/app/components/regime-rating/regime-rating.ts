import { Component } from '@angular/core';
import { Dashboard } from '../dashboard/dashboard';

@Component({
  selector: 'app-regime-rating',
  standalone: true,
  imports: [],
  templateUrl: './regime-rating.html',
  styleUrl: './regime-rating.scss'
})
export class RegimeRating {
constructor(private dashboard: Dashboard) {}

  onComplete() {
    // upload logic…
    this.dashboard.unlockNext('/regime-rating');
    // navigate to next or show success
  }
}
