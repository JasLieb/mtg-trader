import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeHomeComponent } from './trade-home.component';

describe('TradeHomeComponent', () => {
  let component: TradeHomeComponent;
  let fixture: ComponentFixture<TradeHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradeHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TradeHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
