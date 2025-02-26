import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatHomeComponent } from './chat-home.component';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { ChatService } from '../../services/chat/chat.service';
import { of } from 'rxjs';
import { Chat } from '../../models/chat';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth/auth.service';

describe('ChatHomeComponent', () => {
  let component: ChatHomeComponent;
  let fixture: ComponentFixture<ChatHomeComponent>;
  let chatService: jasmine.SpyObj<ChatService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const chatSpy = jasmine.createSpyObj('ChatService', [
      'fetchChats',
      'sendMessage',
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', [
      'fetchChats',
      'sendMessage',
    ]);
    await TestBed.configureTestingModule({
      providers: [
        { provide: ChatService, useValue: chatSpy },
        { provide: AuthService, useValue: authSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of<Params>({ recipientId: 'id' }),
          },
        },
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      imports: [ChatHomeComponent, RouterModule.forRoot([])],
    }).compileComponents();

    chatService = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
    chatService.chats$ = of(makeChats());
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authService.connectedUserToken$ = of('toto');

    fixture = TestBed.createComponent(ChatHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should send message on send message button click', () => {
    component.messageControl.setValue('hello');

    component.sendMessage();

    expect(chatService.sendMessage).toHaveBeenCalledWith('hello', 'id');
  });

  it('should send message on enter key down', () => {
    component.messageControl.setValue('hello');

    component.onKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(chatService.sendMessage).toHaveBeenCalledWith('hello', 'id');
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

function makeChats(): Chat[] {
  return [
    {
      recipient: {
        id: 'toto',
        name: 'jas',
        doubles: [{ id: 't', name: 'toto', uri: 'card', image_uri: 'd' }],
        wanted: [{ id: 't', name: 'toto', uri: 'card', image_uri: 'd' }],
      },
      chatMessages: [],
    },
  ];
}
