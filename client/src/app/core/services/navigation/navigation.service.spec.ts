import { TestBed } from '@angular/core/testing';

import { NavigationService } from './navigation.service';
import { Router, RouterModule } from '@angular/router';
import { initLocalStorageForTests } from '../../utils/localStorage';

describe('NavigationService', () => {
  let service: NavigationService;
  let router: Router;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    routerSpy.navigate.and.callFake(() => Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
      imports: [RouterModule.forRoot([])],
    });

    const _ = initLocalStorageForTests();
    router = TestBed.inject(Router);
    service = TestBed.inject(NavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call router with auth url on navigate auth', (done) => {
    service.navigateAuth();
    service.currentRoute$.subscribe((route) => {
      expect(router.navigate).toHaveBeenCalledWith([service.authUrl]);
      expect(route).toBe(service.authUrl);
      done();
    });
  });

  it('should call router with wantlists url on navigate wantlists', (done) => {
    service.navigateWantlists();
    service.currentRoute$.subscribe((route) => {
      expect(router.navigate).toHaveBeenCalledWith([service.wantlistsUrl]);
      expect(route).toBe(service.wantlistsUrl);
      done();
    });
  });

  it('should call router with doubles url on navigate doubles', (done) => {
    service.navigateDoubles();
    expect(router.navigate).toHaveBeenCalledWith([service.doublesUrl]);
    service.currentRoute$.subscribe((route) => {
      expect(route).toBe(service.doublesUrl);
      done();
    });
  });

  it('should call router with trade url on navigate trade', (done) => {
    service.navigateTrade();
    expect(router.navigate).toHaveBeenCalledWith([service.tradeUrl]);
    service.currentRoute$.subscribe((route) => {
      expect(route).toBe(service.tradeUrl);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'last-route',
        service.tradeUrl
      );
      done();
    });
  });

  it('should save last route on navigation', (done) => {
    service.navigateTrade();
    service.currentRoute$.subscribe((_) => {
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'last-route',
        service.tradeUrl
      );
      done();
    });
  });

  it('should not save last route on auth navigation', (done) => {
    service.navigateAuth();
    service.currentRoute$.subscribe((_) => {
      expect(window.localStorage.setItem).toHaveBeenCalledTimes(0);
      done();
    });
  });

  it('should resume last saved route on resume', (done) => {
    window.localStorage.setItem('last-route', '/trade');
    service.resumeLastRoute();
    service.currentRoute$.subscribe((route) => {
      expect(route).toBe(service.tradeUrl);
      done();
    });
  });

  it('should call router with wantlist urlwhen no saved route on resume', (done) => {
    service.resumeLastRoute();
    service.currentRoute$.subscribe((route) => {
      expect(route).toBe(service.wantlistsUrl);
      done();
    });
  });
});
