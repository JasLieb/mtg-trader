import { TestBed } from '@angular/core/testing';
import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';

import { authInterceptor } from './auth.interceptor';
import { Observable, of } from 'rxjs';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  let localStore: any;

  beforeEach(() => {
    localStore = {};

    spyOn(window.localStorage, 'getItem').and.callFake((key) =>
      key in localStore ? localStore[key] : null
    );
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should check if bearer token is in local storage', () => {
    const mockHandler = {
      handle: (req: HttpRequest<any>): Observable<HttpEvent<any>> => of(new HttpResponse<any>(req))
    };

    interceptor(new HttpRequest<any>('GET', ''), mockHandler.handle);

    expect(window.localStorage.getItem).toHaveBeenCalledTimes(1);

  });

  it('should put bearer token in request when found', () => {
    localStore = { 'usr-token': 'toto' };
    let actualReq = new HttpRequest<any>('GET', '');
    const mockHandler = {
      handle: (req: HttpRequest<any>): Observable<HttpEvent<any>> => {
        actualReq = req;
        return of(new HttpResponse<any>(req));
      }
    };

    interceptor(actualReq, mockHandler.handle);

    expect(actualReq).toBeTruthy();
    expect(actualReq.headers.has('Authorization')).toEqual(true);
    expect(actualReq.headers.get('Authorization')).toEqual(`Bearer toto`);
  });
});
