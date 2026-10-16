import { ComponentFixture, TestBed } from '@angular/core/testing';
import { makeCard } from '../../../common/models/card';
import { CommittedCardWarning } from '../../models/committed-cards';
import { CommittedCardsWarningComponent } from './committed-cards-warning.component';

describe('CommittedCardsWarningComponent', () => {
  let fixture: ComponentFixture<CommittedCardsWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommittedCardsWarningComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommittedCardsWarningComponent);
  });

  function show(warnings: CommittedCardWarning[]) {
    fixture.componentRef.setInput('warnings', warnings);
    fixture.detectChanges();
  }

  function lines(): string[] {
    return Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.committed-card')
    ).map((line) => line.textContent?.trim().replace(/\s+/g, ' ') ?? '');
  }

  // Scenario 4 of the spec.
  it('should name each committed card and the users it is committed with', () => {
    show([
      { card: makeCard('sol-ring', 'Sol Ring'), committedWith: ['Bob'] },
      { card: makeCard('thoughtseize', 'Thoughtseize'), committedWith: ['Bob', 'Carol'] },
    ]);

    expect(lines()).toEqual([
      'Sol Ring is already committed with Bob.',
      'Thoughtseize is already committed with Bob and Carol.',
    ]);
    expect(fixture.nativeElement.textContent).toContain(
      'You can still go ahead if you own more than one copy.'
    );
  });

  it('should show nothing when no card is committed', () => {
    show([]);

    expect(fixture.nativeElement.querySelector('.committed-cards-warning')).toBeNull();
  });
});
