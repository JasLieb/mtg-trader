import { Component, Input, signal } from '@angular/core';
import { Card } from '../../models/card';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [],
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.scss'
})
export class CardListComponent {
  @Input()
  cards : Card[] = [];
}
