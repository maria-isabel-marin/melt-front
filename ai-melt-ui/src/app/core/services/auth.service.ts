import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type { JwtPayload } from '../models/models';

const TOKEN_KEY = 'melt_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private _user = signal<JwtPayload | null>(this.decodeToken(localStorage.getItem(TOKEN_KEY)));

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly isGuest = computed(() => this._user()?.isGuest ?? false);

  constructor(private http: HttpClient, private router: Router) {}

  createGuestSession() {
    return this.http
      .post<{ token: string; user: { id: string; isGuest: boolean } }>(
        `${environment.apiUrl}/auth/guest`,
        {},
      )
      .pipe(tap((res) => this.setToken(res.token)));
  }

  setTokenFromCallback(token: string) {
    this.setToken(token);
  }

  logout() {
    const isGuest = this._user()?.isGuest;
    if (isGuest) {
      this.http.post(`${environment.apiUrl}/auth/guest/logout`, {}).subscribe();
    }
    this.clearToken();
    this.router.navigate(['/']);
  }

  initiateGoogleLogin() {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  private setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
    this._user.set(this.decodeToken(token));
  }

  private clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
    this._user.set(null);
  }

  private decodeToken(token: string | null): JwtPayload | null {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }
}
