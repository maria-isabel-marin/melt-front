import { Component } from '@angular/core';
import { Dashboard } from '../dashboard/dashboard';

@Component({
  selector: 'app-mobilization-metaphors',
  standalone: true,
  imports: [],
  templateUrl: './mobilization-metaphors.html',
  styleUrl: './mobilization-metaphors.scss'
})
export class MobilizationMetaphors {
  constructor(private dashboard: Dashboard) { }

  onComplete() {
    // upload logic…
    this.dashboard.unlockNext('/mobilization-metaphors');
    // navigate to next or show success
  }
}
