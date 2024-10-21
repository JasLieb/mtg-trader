import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isConnectedBehavior = new BehaviorSubject<boolean>(false);
  isConnected$ = this.isConnectedBehavior.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post(`api/auth`, { email, password }, {observe: 'response'})
      .pipe(
        map(
          (response : any) => {
            this.isConnectedBehavior.next(response.status == 200);
          }
        ),
        catchError(err => this.handleError(err)),
      );
  }

  handleError(error: HttpErrorResponse): Observable<any> {
    return of(new Error('Something bad happened; please try again later.'));
  }
}
