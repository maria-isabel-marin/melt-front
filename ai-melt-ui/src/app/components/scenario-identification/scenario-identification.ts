import { Component } from '@angular/core';
import { Dashboard } from '../dashboard/dashboard';

@Component({
  selector: 'app-scenario-identification',
  standalone: true,
  imports: [],
  templateUrl: './scenario-identification.html',
  styleUrl: './scenario-identification.scss'
})
export class ScenarioIdentification {
constructor(private dashboard: Dashboard) {}

  onComplete() {
    // upload logic…
    this.dashboard.unlockNext('/scenario-identification');
    // navigate to next or show success
  }
}
