// eventBus.js
import mitt from 'mitt';

const eventBus = mitt();

export default eventBus;
export * from './const';

export function mittEmit(event, ...args) {
  eventBus.emit(event, ...args);
}

export function mittOn(event, handler) {
  eventBus.on(event, handler);
}

export function mittOff(event, handler) {
  eventBus.off(event, handler);
}

export function mittClear() {
  eventBus.all.clear();
}
