import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoublesComponent } from './doubles.component';
import { WantlistService } from '../../services/wantlist/wantlist.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DoublesComponent', () => {
  let component: DoublesComponent;
  let fixture: ComponentFixture<DoublesComponent>;
  let wantlistService: jasmine.SpyObj<WantlistService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DoublesComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    wantlistService = TestBed.inject(
      WantlistService
    ) as jasmine.SpyObj<WantlistService>;

    fixture = TestBed.createComponent(DoublesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it(`should have displayed doubles`, () => {
    const doubles =
      fixture.debugElement.nativeElement.querySelector('app-wantlist');
    expect(doubles).toBeTruthy();
  });
});
