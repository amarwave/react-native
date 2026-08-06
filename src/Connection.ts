import { EventEmitter } from './EventEmitter';
import type { ConnectionState } from './types';

export class Connection extends EventEmitter {
  _state: ConnectionState = 'initialized';
  private _getSocketId: () => string | null;

  constructor(getSocketId: () => string | null) {
    super();
    this._getSocketId = getSocketId;
  }

  get state(): ConnectionState {
    return this._state;
  }

  get socket_id(): string | null {
    return this._getSocketId();
  }

  _fireState(state: ConnectionState, data?: unknown): void {
    this._state = state;
    this._emit(state, data);
  }

  _fireError(err: Error): void {
    this._emit('error', err);
  }
}
