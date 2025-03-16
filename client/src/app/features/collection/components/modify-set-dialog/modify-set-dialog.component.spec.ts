import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifySetDialogComponent } from './modify-set-dialog.component';

describe('ModifySetDialogComponent', () => {
  let component: ModifySetDialogComponent;
  let fixture: ComponentFixture<ModifySetDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifySetDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifySetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
