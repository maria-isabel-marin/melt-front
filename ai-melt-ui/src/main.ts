import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { importProvidersFrom }                  from '@angular/core';
import { BrowserAnimationsModule }              from '@angular/platform-browser/animations';
import { AppComponent }                                  from './app/app.component';
import { AppRoutingModule }                    from './app/app-routing.module';
import { HttpClientModule } from '@angular/common/http';

// Angular Material modules — each from its own package
import { MatSidenavModule }  from '@angular/material/sidenav';
import { MatToolbarModule }  from '@angular/material/toolbar';
import { MatListModule }     from '@angular/material/list';
import { MatIconModule }     from '@angular/material/icon';
import { MatButtonModule }   from '@angular/material/button';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      BrowserAnimationsModule,
      AppRoutingModule,
      MatSidenavModule,
      MatToolbarModule,
      MatListModule,
      MatIconModule,
      MatButtonModule,
      HttpClientModule
    )
  ]
}).catch(err => console.error(err));