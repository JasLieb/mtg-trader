import { TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { Routes } from '../../models/routesEnum';
import { initLocalStorageForTests } from '../../utils/localStorage';
import { NavigationService } from './navigation.service';

describe('NavigationService to the proposals', () => {
  let service: NavigationService;
  let router: Router;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    routerSpy.navigate.and.callFake(() => Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
      imports: [RouterModule.forRoot([])],
    });

    initLocalStorageForTests();
    router = TestBed.inject(Router);
    service = TestBed.inject(NavigationService);
  });

  it('should call router with proposals url on navigate proposals', (done) => {
    service.navigateProposals();
    service.currentRoute$.subscribe((route) => {
      expect(router.navigate).toHaveBeenCalledWith([Routes.ProposalsUrl]);
      expect(route).toBe(Routes.ProposalsUrl);
      done();
    });
  });
});
