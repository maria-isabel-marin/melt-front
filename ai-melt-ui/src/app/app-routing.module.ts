// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Dashboard }                from './components/dashboard/dashboard';
import { DocumentUpload }           from './components/document-upload/document-upload';
import { MetaphorIdentification }   from './components/metaphor-identification/metaphor-identification';
import { ScenarioIdentification }   from './components/scenario-identification/scenario-identification';
import { RegimeIdentification }     from './components/regime-identification/regime-identification';
import { RegimeRating }             from './components/regime-rating/regime-rating';
import { MobilizationMetaphors }    from './components/mobilization-metaphors/mobilization-metaphors';

const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      {
        path: 'document-upload',
        component: DocumentUpload
      },
      {
        path: 'metaphor-identification',
        component: MetaphorIdentification
      },
      {
        path: 'scenario-identification',
        component: ScenarioIdentification
      },
      {
        path: 'regime-identification',
        component: RegimeIdentification
      },
      {
        path: 'regime-rating',
        component: RegimeRating
      },
      {
        path: 'mobilization-metaphors',
        component: MobilizationMetaphors
      },
          ]
  },
  // catch-all: redirect anything else to dashboard → document-upload
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // enableTracing: true, // <-- for debugging
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

