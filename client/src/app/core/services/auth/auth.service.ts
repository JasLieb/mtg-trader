import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { subscribeOnce } from '../../utils/subscribeExtensions';
import { AuthResponse } from '../../models/auth-response';
import { AuthRequest } from '../../models/auth-request';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authApiUrl = `api/auth`;
  private readonly userApiUrl = `api/user`;
  private readonly userTokenKey = `usr-token`;

  private connectedUserBehavior = new BehaviorSubject<string>('');
  connectedUserToken$ = this.connectedUserBehavior.asObservable();

  constructor(private http: HttpClient) {
    if (this.hasToken()) {
      subscribeOnce(
        this.http.get<AuthResponse>(this.userApiUrl),
        (response) => this.updateConnectedUser(response),
        (_) => this.handleError()
      );
    }
  }

  login(email: string, password: string) {
    this.handleAuth(this.authApiUrl, { email, password });
  }

  register(email: string, password: string) {
    this.handleAuth(this.userApiUrl, { email, password });
  }

  private handleAuth(route: string, body: AuthRequest) {
    subscribeOnce(
      this.http.post<AuthResponse>(route, body),
      (response) => this.updateConnectedUser(response),
      (err) => this.handleError()
    );
  }

  private updateConnectedUser(response: AuthResponse) {
    const token = response.usrToken.replaceAll('Bearer ', '');
    this.connectedUserBehavior.next(token);
    window.localStorage.setItem(this.userTokenKey, token);
  }

  private handleError() {
    window.localStorage.setItem(this.userTokenKey, ``);
    this.connectedUserBehavior.next('');
  }

  private hasToken(): boolean {
    return !!window.localStorage.getItem(this.userTokenKey);
  }
}
