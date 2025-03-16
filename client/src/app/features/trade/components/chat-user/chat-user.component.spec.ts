import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { makeCard } from '../../../common/models/card';
import { Chat } from '../../models/chat';
import { ChatService } from '../../services/chat/chat.service';
import { ChatUserComponent } from './chat-user.component';

describe('ChatUserComponent', () => {
  let component: ChatUserComponent;
  let fixture: ComponentFixture<ChatUserComponent>;
  let chatService: jasmine.SpyObj<ChatService>;

  beforeEach(async () => {
    const chatSpy = jasmine.createSpyObj('ChatService', [
      'fetchChats',
      'sendMessage',
    ]);

    await TestBed.configureTestingModule({
      providers: [
        { provide: ChatService, useValue: chatSpy },
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      imports: [ChatUserComponent],
    }).compileComponents();

    chatService = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;

    fixture = TestBed.createComponent(ChatUserComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('chat', makeChat());
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should order messages by date when set chat input', () => {
    expect(component.messageHistory()[0].message).toEqual('hello1');
    expect(component.messageHistory()[1].message).toEqual('hello2');
  });

  it('should send message on send message button click', () => {
    component.messageControl.setValue('hello');

    component.sendMessage();

    expect(chatService.sendMessage).toHaveBeenCalledWith('hello', 'toto');
  });

  it('should send message on enter key down', () => {
    component.messageControl.setValue('hello');

    component.onKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(chatService.sendMessage).toHaveBeenCalledWith('hello', 'toto');
  });

  it('should not send message if control is empty', () => {
    component.messageControl.setValue('');

    component.onKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(chatService.sendMessage).toHaveBeenCalledTimes(0);
  });

  it('should reset control when message is sent', () => {
    component.messageControl.setValue('message');

    component.onKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(component.messageControl.value).toEqual(null);
  });
});

function makeChat(): Chat {
  return {
    recipient: {
      id: 'toto',
      name: 'jas',
      doubles: [makeCard()],
      wanted: [makeCard()],
    },
    chatMessages: [
      {
        id: '1',
        recipientId: 'toto',
        authorId: 'jas',
        message: 'hello2',
        date: new Date('2021-01-01'),
      },
      {
        id: '2',
        recipientId: 'toto',
        authorId: 'jas',
        message: 'hello1',
        date: new Date('2020-01-01'),
      },
    ],
  };
}
