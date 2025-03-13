import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { Routes } from '../../models/routesEnum';
import { NavigationService } from '../../services/navigation/navigation.service';
import { NavigationBarComponent } from './navigation-bar.component';

describe('NavigationBarComponent', () => {
  let navService: jasmine.SpyObj<NavigationService>;
  let component: NavigationBarComponent;
  let fixture: ComponentFixture<NavigationBarComponent>;

  beforeEach(async () => {
    const navSpy = jasmine.createSpyObj('NavigationService', [
      'resumeLastRoute',
      'navigateAuth',
      'navigateTrade',
      'navigateWantlists',
      'navigateDoubles',
      'navigateChat',
    ]);
    await TestBed.configureTestingModule({
      providers: [{ provide: NavigationService, useValue: navSpy }],
      imports: [NavigationBarComponent],
    }).compileComponents();
  });

  function initFixture(currentRoute?: string) {
    navService = TestBed.inject(
      NavigationService
    ) as jasmine.SpyObj<NavigationService>;
    navService.currentRoute$ = of(currentRoute ?? '');

    fixture = TestBed.createComponent(NavigationBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should be created', () => {
    initFixture();

    expect(component).toBeTruthy();
  });

  it('should navigate to Wantlists when My collection wantlists item is clicked', () => {
    initFixture();

    component.navigateWantlists();

    expect(navService.navigateWantlists).toHaveBeenCalled();
  });

  it('should navigate to Trade when Trade nav item is clicked', () => {
    initFixture();

    component.navigateTrade();

    expect(navService.navigateTrade).toHaveBeenCalled();
  });

  it('should navigate to chat home component when Chat tab is clicked', () => {
    initFixture();

    component.navigateChat();

    expect(navService.navigateChat).toHaveBeenCalled();
  });

  it('should have wantlist underlined when is wantlists url', () => {
    initFixture(Routes.WantlistsUrl);

    fixture.detectChanges();

    expect(component.isWantlistsTab()).toBeTrue();
  });

  it('should have doubles underlined when is doubles url', () => {
    initFixture(Routes.DoublesUrl);
    fixture.detectChanges();

    expect(fixture.componentInstance.isDoublesTab()).toBeTrue();
  });

  it('should have trade underlined when is trade url', () => {
    initFixture(Routes.TradeUrl);

    fixture.detectChanges();

    expect(fixture.componentInstance.isTradeTab()).toBeTrue();
  });

  it('should have chat underlined when is chat url', () => {
    initFixture(Routes.ChatUrl);

    fixture.detectChanges();

    expect(fixture.componentInstance.isChatTab()).toBeTrue();
  });
});
