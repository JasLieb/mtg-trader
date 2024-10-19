import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isConnectedBehavior = new BehaviorSubject<boolean>(false);
  isConnected$ = this.isConnectedBehavior.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<any>('/api/login', { email, password });
    // this is just the HTTP call,
    // we still need to handle the reception of the token
    // .shareReplay()
  }
}
