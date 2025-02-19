import { Observable, Subscription, take } from 'rxjs';

export function subscribeOne<T>(
  observableToSubcribe: Observable<T>,
  next?: (value: T) => void,
  error?: (error: any) => void
): Subscription {
  return observableToSubcribe.pipe(take(1)).subscribe({ next, error });
}
