import { TestBed } from '@angular/core/testing';

import { ChatService } from './chat.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ChathubProxy } from './chathub.proxy';
import { of } from 'rxjs';

describe('ChatService', () => {
  let service: ChatService;
  let chathubProxy: jasmine.SpyObj<ChathubProxy>;

  beforeEach(() => {
    const proxySpy = jasmine.createSpyObj('ChathubProxy', ['sendMessage']);
    TestBed.configureTestingModule({
      providers: [
        { provide: ChathubProxy, useValue: proxySpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    chathubProxy = TestBed.inject(ChathubProxy) as jasmine.SpyObj<ChathubProxy>;
    chathubProxy.chats$ = of([
      {
        recipientId: 'toto',
        chatMessages: [
          {
            id: '',
            message: '',
            authorId: '',
            recipientId: '',
          },
        ],
      },
    ]);
    service = TestBed.inject(ChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send message via proxy when send message', () => {
    service.sendMessage('message', 'recipientID');

    expect(chathubProxy.sendMessage).toHaveBeenCalledWith(
      'message',
      'recipientID'
    );
  });
});
