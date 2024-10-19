import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login should call httpClient', () => {
    service.login('anything@xyz.com', 'poep').subscribe();

    httpTestingController.expectOne('/api/login', 'URL to api login endpoint');
    expect().nothing();
  });
});
