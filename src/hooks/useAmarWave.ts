import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AmarWave } from '../AmarWave';
import type { AmarWaveConfig, ConnectionState } from '../types';

// ── Context ───────────────────────────────────────────────────────────────────

export const AmarWaveContext = createContext<AmarWave | null>(null);

/**
 * Returns the AmarWave client from the nearest `<AmarWaveProvider>`.
 * Throws if called outside a provider.
 */
export function useAmarWaveClient(): AmarWave {
  const client = useContext(AmarWaveContext);
  if (!client) {
    throw new Error('useAmarWaveClient must be used inside <AmarWaveProvider>');
  }
  return client;
}

// ── Provider props ────────────────────────────────────────────────────────────

export interface AmarWaveProviderProps {
  config: AmarWaveConfig;
  children: ReactNode;
}

// NOTE: Provider is exported from index.tsx (JSX file) so this file stays pure TS.

// ── useAmarWave ───────────────────────────────────────────────────────────────

export interface AmarWaveHookResult {
  /** The AmarWave client instance. */
  client: AmarWave;
  /** Current connection state. */
  state: ConnectionState;
  /** Socket ID assigned by the server; null when disconnected. */
  socketId: string | null;
}

/**
 * Create and manage an AmarWave client instance for the lifetime of the component.
 * For app-wide sharing, use `<AmarWaveProvider>` + `useAmarWaveClient()` instead.
 *
 * @example
 * const { client, state } = useAmarWave({ appKey: 'KEY', cluster: 'local' });
 */
export function useAmarWave(config: AmarWaveConfig): AmarWaveHookResult {
  const clientRef = useRef<AmarWave | null>(null);

  if (!clientRef.current) {
    clientRef.current = new AmarWave(config);
  }

  const [state, setState]       = useState<ConnectionState>(clientRef.current.state);
  const [socketId, setSocketId] = useState<string | null>(clientRef.current.socketId);

  useEffect(() => {
    const client = clientRef.current!;

    const onConnected    = () => { setState('connected');    setSocketId(client.socketId); };
    const onDisconnected = () => { setState('disconnected'); setSocketId(null); };
    const onConnecting   = () => { setState('connecting'); };

    client.bind('connected',    onConnected);
    client.bind('disconnected', onDisconnected);
    client.bind('connecting',   onConnecting);

    return () => {
      client.unbind('connected',    onConnected);
      client.unbind('disconnected', onDisconnected);
      client.unbind('connecting',   onConnecting);
      client.destroy();
      clientRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { client: clientRef.current, state, socketId };
}
