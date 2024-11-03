import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authApiUrl = `api/auth`;
  private readonly userApiUrl = `api/user`;
  private readonly userTokenKey = `usr-token`;

  private isConnectedBehavior = new BehaviorSubject<boolean>(false);
  isConnected$ = this.isConnectedBehavior.asObservable();

  constructor(private http: HttpClient) {
    if (this.hasToken()) {
      this.http.get(this.userApiUrl).subscribe({
        next: (_) => this.isConnectedBehavior.next(true),
        error: (err) => this.handleError(err),
      });
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.handleAuth(this.authApiUrl, { email, password });
  }

  register(email: string, password: string): Observable<any> {
    return this.handleAuth(this.userApiUrl, { email, password });
  }

  private handleAuth(route: string, body: any): Observable<any> {
    return this.http.post(route, body).pipe(
      map((response: any) => {
        this.isConnectedBehavior.next(true);
        window.localStorage.setItem(
          this.userTokenKey,
          `Bearer ${response.usrToken}`
        );
      }),
      catchError((err) => this.handleError(err))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    window.localStorage.setItem(this.userTokenKey, ``);
    this.isConnectedBehavior.next(false);
    console.error(error);
    return of(new Error(error.message));
  }

  private hasToken(): boolean {
    return !!window.localStorage.getItem(this.userTokenKey);
  }
}
