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

    httpTestingController.expectOne('api/auth', 'URL to api login endpoint');
    expect().nothing();
  });

  it('success login should update isConnected$', (done) => {
    service.login('anything@xyz.com', 'poep').subscribe();
    const req = httpTestingController.expectOne(
      'api/auth',
      'URL to api login endpoint'
    );
    req.flush({}, { status: 200, statusText: 'ok' });
    service.isConnected$.subscribe((isConnected) => {
      expect(isConnected).toBeTrue();
      done();
    });
  });

  it('fail login should update isConnected$', (done) => {
    service.login('anything@xyz.com', 'poep').subscribe();
    const req = httpTestingController.expectOne(
      'api/auth',
      'URL to api login endpoint'
    );
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    service.isConnected$.subscribe({
      next: (isConnected) => {
        expect(isConnected).toBeFalse();
        done();
      }
    });
  });
});
