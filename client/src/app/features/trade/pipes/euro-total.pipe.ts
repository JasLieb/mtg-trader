import { Pipe, PipeTransform } from '@angular/core';
import { Card } from '../../common/models/card';
import { euroTotal, formatEuroTotal } from '../models/euro-total';

// `cards | euroTotal` shows the euro total of the Cards, flagging those without a price.
@Pipe({ name: 'euroTotal' })
export class EuroTotalPipe implements PipeTransform {
  transform(cards: readonly Card[]): string {
    return formatEuroTotal(euroTotal(cards));
  }
}
