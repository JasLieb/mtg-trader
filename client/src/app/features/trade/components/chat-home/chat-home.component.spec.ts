import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { Chat } from '../../models/chat';
import { ChatService } from '../../services/chat/chat.service';
import { ChatHomeComponent } from './chat-home.component';

describe('ChatHomeComponent', () => {
  let component: ChatHomeComponent;
  let fixture: ComponentFixture<ChatHomeComponent>;
  let route: ActivatedRoute;
  let chatService: jasmine.SpyObj<ChatService>;
  const routeParamsBehavior = new BehaviorSubject<Params>({});

  beforeEach(async () => {
    const chatSpy = jasmine.createSpyObj('ChatService', [
      'fetchChats',
      'sendMessage',
    ]);
    await TestBed.configureTestingModule({
      providers: [
        { provide: ChatService, useValue: chatSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: routeParamsBehavior.asObservable(),
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

    route = TestBed.inject(ActivatedRoute);
    fixture = TestBed.createComponent(ChatHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should set selected chat on route params change', () => {
    routeParamsBehavior.next({ recipientId: 'toto' });

    fixture.detectChanges();

    expect(component.selectedChat()?.recipient.id).toEqual('toto');
  });

  it('should set selected chat on select chat', () => {
    component.selectChat('toto');

    expect(component.selectedChat()?.recipient.id).toEqual('toto');
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
