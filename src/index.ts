/**
 * AmarWave React Native SDK
 * Real-time WebSocket client for AmarWave servers.
 *
 * @example
 * // Wrap your app:
 * import { AmarWaveProvider } from 'amarwave-react-native';
 * <AmarWaveProvider config={{ appKey: 'KEY', cluster: 'local' }}>
 *   <App />
 * </AmarWaveProvider>
 *
 * // Inside a component:
 * import { useEvent } from 'amarwave-react-native';
 * useEvent('public-chat', 'message', (data) => console.log(data));
 */

export { AmarWave }          from './AmarWave';
export { Channel }           from './Channel';
export { Connection }        from './Connection';
export { EventEmitter }      from './EventEmitter';
export { CLUSTERS }          from './clusters';
export { AmarWaveProvider }  from './AmarWaveProvider';

// Hooks
export {
  useAmarWave,
  useAmarWaveClient,
  AmarWaveContext,
} from './hooks/useAmarWave';
export { useChannel } from './hooks/useChannel';
export { useEvent }   from './hooks/useEvent';

export type {
  AmarWaveConfig,
  ResolvedConfig,
  AuthOptions,
  ConnectionState,
  ClusterName,
  Transport,
  AmarWaveEventMap,
  ChannelEventMap,
  EventListener,
  GlobalEventListener,
} from './types';

export type {
  AmarWaveProviderProps,
  AmarWaveHookResult,
} from './hooks/useAmarWave';

export type { ChannelHookResult } from './hooks/useChannel';

export { AmarWave as default } from './AmarWave';
