import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { importProvidersFrom }                  from '@angular/core';
import { BrowserAnimationsModule }              from '@angular/platform-browser/animations';
import { App }                                  from './app/app';
import { AppRoutingModule }                    from './app/app-routing.module';

// Angular Material modules — each from its own package
import { MatSidenavModule }  from '@angular/material/sidenav';
import { MatToolbarModule }  from '@angular/material/toolbar';
import { MatListModule }     from '@angular/material/list';
import { MatIconModule }     from '@angular/material/icon';
import { MatButtonModule }   from '@angular/material/button';

bootstrapApplication(App, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      BrowserAnimationsModule,
      AppRoutingModule,
      MatSidenavModule,
      MatToolbarModule,
      MatListModule,
      MatIconModule,
      MatButtonModule
    )
  ]
}).catch(err => console.error(err));