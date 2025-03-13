import { TestBed } from '@angular/core/testing';

import { Router, RouterModule } from '@angular/router';
import { Routes } from '../../models/routesEnum';
import { initLocalStorageForTests } from '../../utils/localStorage';
import { NavigationService } from './navigation.service';

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
      expect(router.navigate).toHaveBeenCalledWith([Routes.AuthUrl]);
      expect(route).toBe(Routes.AuthUrl);
      done();
    });
  });

  it('should call router with wantlists url on navigate wantlists', (done) => {
    service.navigateWantlists();
    service.currentRoute$.subscribe((route) => {
      expect(router.navigate).toHaveBeenCalledWith([Routes.WantlistsUrl]);
      expect(route).toBe(Routes.WantlistsUrl);
      done();
    });
  });

  it('should call router with doubles url on navigate doubles', (done) => {
    service.navigateDoubles();
    expect(router.navigate).toHaveBeenCalledWith([Routes.DoublesUrl]);
    service.currentRoute$.subscribe((route) => {
      expect(route).toBe(Routes.DoublesUrl);
      done();
    });
  });

  it('should call router with trade url on navigate trade', (done) => {
    service.navigateTrade();
    expect(router.navigate).toHaveBeenCalledWith([Routes.TradeUrl]);
    service.currentRoute$.subscribe((route) => {
      expect(route).toBe(Routes.TradeUrl);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'last-route',
        Routes.TradeUrl
      );
      done();
    });
  });

  it('should call router with chat url on chat trade', (done) => {
    service.navigateChat();
    expect(router.navigate).toHaveBeenCalledWith([Routes.ChatUrl]);
    service.currentRoute$.subscribe((route) => {
      expect(route).toBe(Routes.ChatUrl);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'last-route',
        Routes.ChatUrl
      );
      done();
    });
  });

  it('should call router with chat url and recipientId on chat trade with user', () => {
    service.navigateChat('recipientId');
    expect(router.navigate).toHaveBeenCalledWith([
      Routes.ChatUrl,
      'recipientId',
    ]);
  });

  it('should save last route on navigation', (done) => {
    service.navigateTrade();
    service.currentRoute$.subscribe((_) => {
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'last-route',
        Routes.TradeUrl
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
      expect(route).toBe(Routes.TradeUrl);
      done();
    });
  });

  it('should call router with wantlist url when no saved route on resume', (done) => {
    service.resumeLastRoute();
    service.currentRoute$.subscribe((route) => {
      expect(route).toBe(Routes.WantlistsUrl);
      done();
    });
  });
});
