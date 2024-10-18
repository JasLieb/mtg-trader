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

  it('should be created', (done) => {
    expect(service).toBeTruthy();
    expect(window.localStorage.getItem).toHaveBeenCalledTimes(2);
    expect(window.localStorage.getItem).toHaveBeenCalledWith('wantlists');
    expect(window.localStorage.getItem).toHaveBeenCalledWith('doubles');
    service.wantlists$.subscribe((wls) => {
      expect(wls.length).toBe(0);
    });
    service.doubles$.subscribe((double) => {
      expect(double.cards.length).toBe(0);
      done();
    });
  });

  it('should update storage when update wantlist', (done) => {
    service.updateWantlist({ id: 'updated', name: 'wl', cards: [] });
    expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);
    service.wantlists$.subscribe((wls) => {
      expect(wls.length).toBe(1);
      done();
    });
  });

  it('should update storage when wantlist is created', (done) => {
    service.create('Killing in the name');
    expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);
    service.wantlists$.subscribe((wls) => {
      expect(wls.length).toBe(1);
      expect(wls[0].name).toBe('Killing in the name');
      done();
    });
  });
});
