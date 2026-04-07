import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./features/auth/callback/auth-callback').then((m) => m.AuthCallbackComponent),
  },
  {
    path: '',
    loadComponent: () => import('./shared/shell/shell').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'corpus',
        loadComponent: () =>
          import('./features/corpus/corpus-list/corpus-list').then((m) => m.CorpusListComponent),
      },
      {
        path: 'corpus/:id',
        loadComponent: () =>
          import('./features/corpus/corpus-detail/corpus-detail').then((m) => m.CorpusDetailComponent),
      },
      {
        path: 'corpus/:corpusId/document/:docId',
        loadComponent: () =>
          import('./features/analysis/document-analysis/document-analysis').then(
            (m) => m.DocumentAnalysisComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
