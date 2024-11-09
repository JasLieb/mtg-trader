import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WantlistsManagerComponent } from './wantlists-manager.component';
import { WantlistService } from '../../services/wantlist/wantlist.service';
import { of } from 'rxjs';
import { Wantlist } from '../../models/wantlist';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('WantlistsManagerComponent', () => {
  let component: WantlistsManagerComponent;
  let fixture: ComponentFixture<WantlistsManagerComponent>;
  let wantlistService: jasmine.SpyObj<WantlistService>;

  beforeEach(async () => {
    const wantlistSpy = jasmine.createSpyObj('WantlistService', ['create', 'delete']);

    await TestBed.configureTestingModule({
      providers: [{ provide: WantlistService, useValue: wantlistSpy }],
      imports: [
        WantlistsManagerComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    wantlistService = TestBed.inject(
      WantlistService
    ) as jasmine.SpyObj<WantlistService>;
    wantlistService.wantlists$ = of([
      { id: 't', name: 'toto', cards: [] },
    ] as Wantlist[]);

    fixture = TestBed.createComponent(WantlistsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should allow new wantlist name addition', () => {
    const textInput = fixture.nativeElement.querySelector('input');
    expect(textInput).toBeTruthy();
    expect(textInput.placeholder).toBe('My new wantlist');
    expect(fixture.nativeElement.querySelectorAll('button')[0]).toBeTruthy();
  });

  it('should not create new wantlistwhen name is empty', () => {
    component.wantlistNameControl.setValue('');

    const actions = fixture.nativeElement.querySelectorAll('button');
    actions[0].click();

    expect(wantlistService.create.calls.count()).toEqual(0);
  });

  it('should add new wantlist whit given name when create button is clicked', () => {
    component.wantlistNameControl.setValue('Killing in the name');

    const actions = fixture.nativeElement.querySelectorAll('button');
    actions[0].click();

    expect(wantlistService.create.calls.count()).toEqual(1);
    expect(wantlistService.create).toHaveBeenCalledWith('Killing in the name');
  });

  it('should have wantlist deletion button', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const deleteButton = buttons[buttons.length - 1];
    expect(deleteButton).toBeTruthy();
    expect(deleteButton.textContent).toBe('Delete wantlist');
  });

  it('should delete wantlist when delete button is clicked', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const deleteButton = buttons[buttons.length - 1];
    deleteButton.click();

    expect(wantlistService.delete.calls.count()).toBe(1);
    expect(wantlistService.delete).toHaveBeenCalledWith('t');
  });
});
