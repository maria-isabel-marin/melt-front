import { Component } from '@angular/core';
import { Dashboard } from '../dashboard/dashboard';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [],
  templateUrl: './document-upload.html',
  styleUrl: './document-upload.scss'
})
export class DocumentUpload {
  constructor(private dashboard: Dashboard) {}

  onComplete() {
    // upload logic…
    this.dashboard.unlockNext('/document-upload');
    // navigate to next or show success
  }
}
