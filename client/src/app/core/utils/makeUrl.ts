import { environment } from "../../../environments/environment";

export function makeApiUrl(route: string): string {
  if (environment.apiURl === '') {
    return route;
  }
  return `${environment.apiURl}/${route}`;
}
