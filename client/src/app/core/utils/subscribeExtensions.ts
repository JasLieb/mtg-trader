import { delay, Observable, take, tap } from 'rxjs';

export function subscribeOnce<T>(
  observableToSubcribe: Observable<T>,
  next?: (value: T) => void,
  error?: (error: any) => void
) {
  observableToSubcribe.pipe(take(1)).subscribe({ next, error });
}

export function tapOnce<T>(
  observableToSubcribe: Observable<T>,
  next?: (value: T) => void,
  error?: (error: any) => void
): Observable<T> {
  return observableToSubcribe.pipe(take(1), tap({ next, error }));
}
