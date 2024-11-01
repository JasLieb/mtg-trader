import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;
  let localStore: any;

  beforeEach(() => {
    localStore = { 'usr-token': 'toto' };

    spyOn(window.localStorage, 'getItem').and.callFake((key) =>
      key in localStore ? localStore[key] : null
    );
    spyOn(window.localStorage, 'setItem').and.callFake(
      (key, value) => (localStore[key] = value + '')
    );
    spyOn(window.localStorage, 'clear').and.callFake(() => (localStore = {}));

    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be connected on creation when local storage contains token', (done) => {
    service.isConnected$.subscribe(isConnected => {
      expect(window.localStorage.getItem).toHaveBeenCalledTimes(1);
      expect(isConnected).toBeTrue();
      done();
    })
  });

  it('success login should update isConnected$', (done) => {
    service.login('anything@xyz.com', 'poep').subscribe();
    const req = httpTestingController.expectOne(
      'api/auth',
      'URL to api login endpoint'
    );
    req.flush('toto', { status: 200, statusText: 'ok' });
    service.isConnected$.subscribe((isConnected) => {
      expect(isConnected).toBeTrue();
      done();
    });
  });

  it('success login should update local storage with bearer token', () => {
    service.login('anything@xyz.com', 'poep').subscribe();

    const req = httpTestingController.expectOne(
      'api/auth',
      'URL to api login endpoint'
    );
    req.flush({ usrToken: 'toto' }, { status: 200, statusText: 'ok' });

    expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'usr-token',
      'Bearer toto'
    );
  });

  it('fail login should update isConnected$', (done) => {
    service.login('anything@xyz.com', 'poep').subscribe();
    const req = httpTestingController.expectOne(
      'api/auth',
      'URL to api post login endpoint'
    );
    expect(req.request.method).toBe('POST');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    service.isConnected$.subscribe({
      next: (isConnected) => {
        expect(isConnected).toBeFalse();
        done();
      },
    });
  });

  it('success register should update isConnected$', (done) => {
    service.register('anything@xyz.com', 'poep').subscribe();
    const req = httpTestingController.expectOne(
      'api/user',
      'URL to api register endpoint'
    );
    req.flush('toto', { status: 200, statusText: 'ok' });
    service.isConnected$.subscribe((isConnected) => {
      expect(isConnected).toBeTrue();
      done();
    });
  });

  it('success register should update local storage with bearer token', () => {
    service.register('anything@xyz.com', 'poep').subscribe();

    const req = httpTestingController.expectOne(
      'api/user',
      'URL to api register endpoint'
    );
    req.flush({ usrToken: 'toto' }, { status: 200, statusText: 'ok' });

    expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'usr-token',
      'Bearer toto'
    );
  });

  it('fail register should update isConnected$', (done) => {
    service.register('anything@xyz.com', 'poep').subscribe();
    const req = httpTestingController.expectOne(
      'api/user',
      'URL to api login endpoint'
    );

    req.flush({}, { status: 500, statusText: 'Error' });

    service.isConnected$.subscribe({
      next: (isConnected) => {
        expect(isConnected).toBeFalse();
        done();
      },
    });
  });
});
