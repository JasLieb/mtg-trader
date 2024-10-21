import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isConnectedBehavior: BehaviorSubject<boolean>;
  isConnected$: Observable<boolean>;

  constructor(private http: HttpClient) {
    this.isConnectedBehavior = new BehaviorSubject<boolean>(this.hasToken());
    this.isConnected$ = this.isConnectedBehavior.asObservable();
  }

  login(email: string, password: string) {
    return this.http.post(`api/auth`, { email, password }).pipe(
      map((response: any) => {
        this.isConnectedBehavior.next(true);
        window.localStorage.setItem('usr-token', `Bearer ${response.usrToken}`);
      }),
      catchError((err) => this.handleError(err))
    );
  }

  handleError(error: HttpErrorResponse): Observable<any> {
    this.isConnectedBehavior.next(false);
    console.error(error);
    return of(new Error(error.message));
  }

  private hasToken(): boolean {
    return !!window.localStorage.getItem('usr-token');
  }
}
