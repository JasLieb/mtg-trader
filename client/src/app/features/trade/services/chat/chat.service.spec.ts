import { TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { TradeService } from '../trade/trade.service';
import { ChatService } from './chat.service';
import { ChathubProxy } from './chathub.proxy';

describe('ChatService', () => {
  let service: ChatService;
  let tradeService: jasmine.SpyObj<TradeService>;
  let chathubProxy: jasmine.SpyObj<ChathubProxy>;

  const oneUser = {
    id: 'toto',
    name: 'jas',
    doubles: [{ id: 't', name: 'toto', uri: 'card', image_uri: 'd' }],
    wanted: [{ id: 't', name: 'toto', uri: 'card', image_uri: 'd' }],
  };

  const anotherUser = {
    id: 'another',
    name: 'another',
    doubles: [{ id: 't', name: 'toto', uri: 'card', image_uri: 'd' }],
    wanted: [{ id: 't', name: 'toto', uri: 'card', image_uri: 'd' }],
  };

  const userTrades = [oneUser, anotherUser];

  const receivedChats = [
    {
      recipientId: 'toto',
      chatMessages: [
        {
          id: '',
          message: '',
          authorId: '',
          recipientId: '',
          date: new Date(),
        },
      ],
    },
  ];

  beforeEach(() => {
    const tradeSpy = jasmine.createSpyObj('TradeService', ['find']);
    const proxySpy = jasmine.createSpyObj('ChathubProxy', ['sendMessage']);
    TestBed.configureTestingModule({
      providers: [
        { provide: ChathubProxy, useValue: proxySpy },
        { provide: TradeService, useValue: tradeSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    tradeService = TestBed.inject(TradeService) as jasmine.SpyObj<TradeService>;
    tradeService.find.and.callFake(() => of(userTrades));

    chathubProxy = TestBed.inject(ChathubProxy) as jasmine.SpyObj<ChathubProxy>;
    chathubProxy.chats$ = of(receivedChats);
    service = TestBed.inject(ChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should merge chat recipient with usertrader data when new emit', (done) => {
    service.chats$.subscribe((chats) => {
      expect(chats.length).toBe(1);
      expect(chats[0].recipient).toBe(userTrades[0]);
      expect(chats[0].chatMessages).toBe(receivedChats[0].chatMessages);
      done();
    });
  });

  it('should add new chat in chats$ when init chat', (done) => {
    service.initChat(anotherUser);
    service.chats$.subscribe((chats) => {
      expect(chats.length).toBe(2);
      done();
    });
  });

  it('should not add new chat in chats$ when init chat and already exists', (done) => {
    service.initChat(oneUser);
    service.chats$.subscribe((chats) => {
      expect(chats.length).toBe(1);
      done();
    });
  });

  it('should send message via proxy when send message', () => {
    service.sendMessage('message', 'recipientID');

    expect(chathubProxy.sendMessage).toHaveBeenCalledWith(
      'message',
      'recipientID'
    );
  });
});
