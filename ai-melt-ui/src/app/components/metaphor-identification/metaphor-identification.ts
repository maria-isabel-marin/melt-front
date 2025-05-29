import { Component } from '@angular/core';
import { Dashboard } from '../dashboard/dashboard';

@Component({
  selector: 'app-metaphor-identification',
  standalone: true,
  imports: [],
  templateUrl: './metaphor-identification.html',
  styleUrl: './metaphor-identification.scss'
})
export class MetaphorIdentification {
  constructor(private dashboard: Dashboard) {}

  onComplete() {
    // upload logic…
    this.dashboard.unlockNext('/metaphor-identification');
    // navigate to next or show success
  }
}
