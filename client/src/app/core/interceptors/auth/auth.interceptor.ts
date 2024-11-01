import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('api/')) {
    var accountToken = window.localStorage.getItem('usr-token');
    if (accountToken) {
      req = req.clone({
          setHeaders: { Authorization: accountToken }
      });
    }
  }
  return next(req);
};
