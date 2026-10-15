import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoublesComponent } from './doubles.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DoublesComponent', () => {
  let component: DoublesComponent;
  let fixture: ComponentFixture<DoublesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DoublesComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

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
