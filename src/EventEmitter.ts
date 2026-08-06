import type { EventListener, GlobalEventListener } from './types';

export class EventEmitter {
  private _listeners: Record<string, EventListener[]> = {};
  private _globals: GlobalEventListener[] = [];

  bind<T = unknown>(event: string, fn: EventListener<T>): this {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn as EventListener);
    return this;
  }

  on<T = unknown>(event: string, fn: EventListener<T>): this {
    return this.bind(event, fn);
  }

  unbind(event: string, fn?: EventListener): this {
    if (!fn) {
      delete this._listeners[event];
    } else {
      this._listeners[event] = (this._listeners[event] ?? []).filter(f => f !== fn);
    }
    return this;
  }

  off(event: string, fn?: EventListener): this {
    return this.unbind(event, fn);
  }

  bind_global(fn: GlobalEventListener): this {
    this._globals.push(fn);
    return this;
  }

  unbind_global(fn?: GlobalEventListener): this {
    if (!fn) this._globals = [];
    else this._globals = this._globals.filter(f => f !== fn);
    return this;
  }

  protected _emit(event: string, data?: unknown): void {
    (this._listeners[event] ?? []).slice().forEach(fn => fn(data));
    this._globals.slice().forEach(fn => fn(event, data));
  }

  once<T = unknown>(event: string): Promise<T> {
    return new Promise<T>(resolve => {
      const fn: EventListener<T> = (data: T) => {
        this.unbind(event, fn as EventListener);
        resolve(data);
      };
      this.bind(event, fn);
    });
  }
}
