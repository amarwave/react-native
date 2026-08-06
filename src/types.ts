export type Transport = 'ws' | 'wss';

export type ConnectionState =
  | 'initialized'
  | 'connecting'
  | 'connected'
  | 'disconnected';

export type ClusterName =
  | 'default'
  | 'local'
  | 'ap1'
  | 'ap2'
  | 'eu'
  | 'us'
  | (string & {});

export interface AuthOptions {
  headers?: Record<string, string>;
}

export interface AmarWaveConfig {
  appKey: string;
  appSecret?: string;

  wsHost?: string;
  wsPort?: number;
  wssPort?: number;
  apiHost?: string;
  apiPort?: number;
  apiPath?: string;
  wsPath?: string;

  forceTLS?: boolean;
  cluster?: ClusterName;

  authEndpoint?: string;
  auth?: AuthOptions;

  reconnectDelay?: number;
  maxReconnectDelay?: number;
  maxRetries?: number;

  activityTimeout?: number;
  pongTimeout?: number;

  disableStats?: boolean;
  enabledTransports?: Transport[];

  /**
   * Automatically disconnect when the app goes to the background
   * and reconnect when it returns to the foreground.
   * Requires React Native's `AppState` API (available by default).
   * @default true
   */
  handleAppState?: boolean;
}

export interface ResolvedConfig extends Required<AmarWaveConfig> {
  apiHost: string;
  apiPath: string;
  wsPath:  string;
}

export interface AmarWaveEventMap {
  connecting:   undefined;
  connected:    undefined;
  disconnected: undefined;
  error:        Error;
  [event: string]: unknown;
}

export interface ChannelEventMap {
  subscribed: unknown;
  error:      string | Error;
  amarwave_internal__subscription_succeeded: unknown;
  amarwave_internal__subscription_error:     string;
  [event: string]: unknown;
}

export type EventListener<T = unknown>   = (data: T) => void;
export type GlobalEventListener         = (event: string, data: unknown) => void;
