export function initLocalStorageForTests(): Record<string, string> {
  let localStore: Record<string, string> = { 'usr-token': 'toto' };

  spyOn(window.localStorage, 'getItem').and.callFake((key) =>
    key in localStore ? localStore[key] : null
  );
  spyOn(window.localStorage, 'setItem').and.callFake(
    (key, value) => (localStore[key] = value + '')
  );
  spyOn(window.localStorage, 'clear').and.callFake(() => (localStore = {}));
  return localStore;
}
