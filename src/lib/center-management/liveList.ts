/** Array that always reads fresh Center Management data for map/filter/find/spread. */
export function liveArray<T>(load: () => T[]): T[] {
  const handler: ProxyHandler<T[]> = {
    get(_target, prop) {
      const live = load();
      const value = Reflect.get(live, prop, live);
      if (typeof value === 'function') {
        return (value as (...args: unknown[]) => unknown).bind(live);
      }
      return value;
    },
    ownKeys() {
      return Reflect.ownKeys(load());
    },
    getOwnPropertyDescriptor(_target, prop) {
      return Object.getOwnPropertyDescriptor(load(), prop);
    },
    has(_target, prop) {
      return Reflect.has(load(), prop);
    },
    getPrototypeOf() {
      return Array.prototype;
    },
  };
  return new Proxy([] as T[], handler);
}
