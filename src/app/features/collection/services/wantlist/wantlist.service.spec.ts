import { TestBed } from '@angular/core/testing';

import { WantlistService } from './wantlist.service';

describe('WantlistService', () => {
  let service: WantlistService;
  let localStore: any;

  beforeEach(() => {
    localStore = {};

    spyOn(window.localStorage, 'getItem').and.callFake((key) =>
      key in localStore ? localStore[key] : null
    );
    spyOn(window.localStorage, 'setItem').and.callFake(
      (key, value) => (localStore[key] = value + '')
    );
    spyOn(window.localStorage, 'clear').and.callFake(() => (localStore = {}));

    TestBed.configureTestingModule({});
    service = TestBed.inject(WantlistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return undefined when unknown wantlist id', () => {
    const wantlist = service.getWantlist('id');
    expect(wantlist).toBeUndefined();
  });

  it('should update storage when update wantlist', () => {
    service.updateWantlist({id:'updated', name: 'wl', cards: []});
    expect(service.getWantlist('updated')).toBeTruthy();
  });
});
