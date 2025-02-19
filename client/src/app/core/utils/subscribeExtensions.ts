import { Observable, take } from 'rxjs';

export function subscribeOnce<T>(
  observableToSubcribe: Observable<T>,
  next?: (value: T) => void,
  error?: (error: any) => void
) {
  observableToSubcribe.pipe(take(1)).subscribe({ next, error });
}
