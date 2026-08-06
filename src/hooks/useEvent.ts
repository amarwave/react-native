import { useEffect, useRef } from 'react';
import { useAmarWaveClient } from './useAmarWave';
import type { EventListener } from '../types';

/**
 * Bind to a specific event on a channel. The handler is automatically
 * registered on mount and removed on unmount or when any dependency changes.
 *
 * Must be used inside an `<AmarWaveProvider>`.
 *
 * @example
 * useEvent<MessagePayload>('public-chat', 'message', (data) => {
 *   setMessages(prev => [...prev, data]);
 * });
 */
export function useEvent<T = unknown>(
  channelName: string,
  event: string,
  handler: EventListener<T>,
): void {
  const client     = useAmarWaveClient();
  // Stable ref so we don't re-subscribe if the caller passes an inline function
  const handlerRef = useRef<EventListener<T>>(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const ch = client.subscribe(channelName);
    const fn: EventListener<T> = (data) => handlerRef.current(data);
    ch.bind(event, fn);

    return () => {
      ch.unbind(event, fn as EventListener);
    };
  }, [client, channelName, event]);
}
