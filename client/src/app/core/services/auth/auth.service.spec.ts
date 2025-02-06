import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { initLocalStorageForTests } from '../../utils/localStorage';
import { provideHttpClient } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const _ = initLocalStorageForTests();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request get call when creation and local storage contains token', () => {
    const req = httpTestingController.expectOne(
      'api/user',
      'URL to api get user endpoint'
    );
    expect(req.request.method).toBe('GET');
  });

  it('should be connected when check valid token', (done) => {
    const req = httpTestingController.expectOne(
      'api/user',
      'URL to api get user endpoint'
    );

    service.isConnected$.subscribe((isConnected) => {
      expect(window.localStorage.getItem).toHaveBeenCalledTimes(1);
      expect(isConnected).toBeTrue();
      done();
    });

    req.flush({}, { status: 200, statusText: 'ok' });
  });

  it('should not be connected when check invalid token', (done) => {
    const req = httpTestingController.expectOne(
      'api/user',
      'URL to api get user endpoint'
    );

    service.isConnected$.subscribe((isConnected) => {
      expect(window.localStorage.getItem).toHaveBeenCalledTimes(1);
      expect(isConnected).toBeFalse();
      done();
    });

    req.flush({}, { status: 500, statusText: 'invalid token' });
  });

  it('success login should update isConnected$', (done) => {
    service.login('anything@xyz.com', 'poep');
    const reqs = httpTestingController.match(
      (req) => req.method == 'POST' && req.url == 'api/auth'
    );

    service.isConnected$.subscribe((isConnected) => {
      expect(isConnected).toBeTrue();
      done();
    });

    reqs[0].flush('toto', { status: 200, statusText: 'ok' });
  });

  it('success login should update local storage with bearer token', () => {
    service.login('anything@xyz.com', 'poep');

    const reqs = httpTestingController.match(
      (req) => req.method == 'POST' && req.url == 'api/auth'
    );
    reqs[0].flush({ usrToken: 'toto' }, { status: 200, statusText: 'ok' });

    expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'usr-token',
      'Bearer toto'
    );
  });

  it('fail login should update isConnected$', (done) => {
    service.login('anything@xyz.com', 'poep');
    const reqs = httpTestingController.match(
      (req) => req.method == 'POST' && req.url == 'api/auth'
    );

    service.isConnected$.subscribe((isConnected) => {
      expect(isConnected).toBeFalse();
      done();
    });

    reqs[0].flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  it('success register should update isConnected$', (done) => {
    service.register('anything@xyz.com', 'poep');
    const reqs = httpTestingController.match(
      (req) => req.method == 'POST' && req.url == 'api/user'
    );
    service.isConnected$.subscribe((isConnected) => {
      expect(isConnected).toBeTrue();
      done();
    });

    reqs[0].flush('toto', { status: 200, statusText: 'ok' });
  });

  it('success register should update local storage with bearer token', () => {
    service.register('anything@xyz.com', 'poep');

    const reqs = httpTestingController.match(
      (req) => req.method == 'POST' && req.url == 'api/user'
    );

    reqs[0].flush({ usrToken: 'toto' }, { status: 200, statusText: 'ok' });

    expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'usr-token',
      'Bearer toto'
    );
  });

  it('fail register should update isConnected$', (done) => {
    service.register('anything@xyz.com', 'poep');
    const reqs = httpTestingController.match(
      (req) => req.method == 'POST' && req.url == 'api/user'
    );

    service.isConnected$.subscribe((isConnected) => {
      expect(isConnected).toBeFalse();
      done();
    });

    reqs[0].flush({}, { status: 500, statusText: 'Error' });
  });
});
