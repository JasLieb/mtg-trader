import { Component, input } from '@angular/core';
import {
  CommittedCardWarning,
  formatUserNames,
} from '../../models/committed-cards';

// Warns the user who is about to commit their own cards that some are already committed, and with
// whom. It blocks nothing: without quantities, the app can't tell whether they own several copies.
// Shows nothing when no card is committed.
@Component({
  selector: 'app-committed-cards-warning',
  templateUrl: './committed-cards-warning.component.html',
  styleUrl: './committed-cards-warning.component.scss',
})
export class CommittedCardsWarningComponent {
  warnings = input<CommittedCardWarning[]>([]);

  readonly formatUserNames = formatUserNames;
}
