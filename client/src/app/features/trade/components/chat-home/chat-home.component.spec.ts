import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatHomeComponent } from './chat-home.component';
import { RouterModule } from '@angular/router';
import { ChatService } from '../../services/chat/chat.service';
import { of } from 'rxjs';
import { Chat } from '../../models/chat';

describe('ChatHomeComponent', () => {
  let component: ChatHomeComponent;
  let fixture: ComponentFixture<ChatHomeComponent>;
  let chatService: jasmine.SpyObj<ChatService>;

  beforeEach(async () => {
    const chatSpy = jasmine.createSpyObj('ChatService', ['fetchChats']);
    await TestBed.configureTestingModule({
      providers: [{ provide: ChatService, useValue: chatSpy }],
      imports: [ChatHomeComponent, RouterModule.forRoot([])],
    }).compileComponents();

    chatService = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
    chatService.fetchChats.and.callFake(() => of(makChats()));

    fixture = TestBed.createComponent(ChatHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should do fetch chats when is created', () => {
    expect(chatService.fetchChats).toHaveBeenCalled();
  });
});

function makChats(): Chat[] {
  return [
    {
      id: '1',
      recipient: {
        id: 'toto',
        name: 'jas',
        doubles: [{ id: 't', name: 'toto', uri: 'card', image_uri: 'd' }],
        wanted: [{ id: 't', name: 'toto', uri: 'card', image_uri: 'd' }],
      },
      messages: ['hello'],
    },
  ];
}
