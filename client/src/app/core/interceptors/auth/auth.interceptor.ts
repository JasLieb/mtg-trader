import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  var accountToken = window.localStorage.getItem('usr-token');
  if (accountToken) {
    req = req.clone({
        setHeaders: { Authorization: `Bearer ${accountToken}` }
    });
  }
  return next(req);
};
