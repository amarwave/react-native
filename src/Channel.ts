import { EventEmitter } from './EventEmitter';
import type { EventListener, GlobalEventListener } from './types';

interface QueuedPublish {
  event:   string;
  data:    unknown;
  resolve: (ok: boolean) => void;
}

export class Channel extends EventEmitter {
  readonly name: string;
  subscribed: boolean = false;

  private _aw: {
    _httpPublish(channel: string, event: string, data: unknown): Promise<boolean>;
  };
  private _queue: QueuedPublish[] = [];

  constructor(
    name: string,
    client: { _httpPublish(channel: string, event: string, data: unknown): Promise<boolean> },
  ) {
    super();
    this.name = name;
    this._aw  = client;
  }

  bind<T = unknown>(event: string, fn: EventListener<T>): this {
    return super.bind(event, fn);
  }

  on<T = unknown>(event: string, fn: EventListener<T>): this {
    return super.on(event, fn);
  }

  bind_global(fn: GlobalEventListener): this {
    return super.bind_global(fn);
  }

  publish<T = unknown>(event: string, data: T): Promise<boolean> {
    if (!this.subscribed) {
      return new Promise<boolean>(resolve => {
        this._queue.push({ event, data, resolve });
      });
    }
    return this._aw._httpPublish(this.name, event, data);
  }

  trigger<T = unknown>(event: string, data: T): Promise<boolean> {
    return this.publish(event, data);
  }

  _flushQueue(): void {
    this._queue.splice(0).forEach(({ event, data, resolve }) => {
      this._aw._httpPublish(this.name, event, data).then(resolve);
    });
  }

  _fireEvent(event: string, data?: unknown): void {
    this._emit(event, data);
  }
}
