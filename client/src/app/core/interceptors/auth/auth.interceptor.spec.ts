import { TestBed } from '@angular/core/testing';
import { HttpEvent, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';

import { authInterceptor } from './auth.interceptor';
import { Observable, of } from 'rxjs';
import { initLocalStorageForTests } from '../../utils/localStorage';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  beforeEach(() => {
    initLocalStorageForTests();
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should check if bearer token is in local storage', () => {
    const mockHandler = {
      handle: (req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> => of(new HttpResponse<unknown>(req))
    };

    interceptor(new HttpRequest<unknown>('GET', 'api/'), mockHandler.handle);

    expect(window.localStorage.getItem).toHaveBeenCalledTimes(1);

  });

  it('should put bearer token in api request when found', () => {
    let actualReq = new HttpRequest<unknown>('GET', 'api/');
    const mockHandler = {
      handle: (req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> => {
        actualReq = req;
        return of(new HttpResponse<unknown>(req));
      }
    };

    interceptor(actualReq, mockHandler.handle);

    expect(actualReq).toBeTruthy();
    expect(actualReq.headers.has('Authorization')).toEqual(true);
    expect(actualReq.headers.get('Authorization')).toEqual(`Bearer toto`);
  });

  it('should not put bearer token in request when is not an api request', () => {
    let actualReq = new HttpRequest<unknown>('GET', 'https://sryfall.io/');
    const mockHandler = {
      handle: (req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> => {
        actualReq = req;
        return of(new HttpResponse<unknown>(req));
      }
    };

    interceptor(actualReq, mockHandler.handle);

    expect(actualReq).toBeTruthy();
    expect(actualReq.headers.has('Authorization')).toEqual(false);
  });
});
