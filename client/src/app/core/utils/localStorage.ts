export function initLocalStorageForTests(): any {
  let localStore = { 'usr-token': 'toto' } as any;

  spyOn(window.localStorage, 'getItem').and.callFake((key) =>
    key in localStore ? localStore[key] : null
  );
  spyOn(window.localStorage, 'setItem').and.callFake(
    (key, value) => (localStore[key] = value + '')
  );
  spyOn(window.localStorage, 'clear').and.callFake(() => (localStore = {}));
  return localStore;
}
