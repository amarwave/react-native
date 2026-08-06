import { useEffect, useRef, useState } from 'react';
import { Channel } from '../Channel';
import { useAmarWaveClient } from './useAmarWave';

export interface ChannelHookResult {
  /** The Channel instance. Use it to call `.bind()` or `.publish()`. */
  channel: Channel | null;
  /** `true` once the server has confirmed the subscription. */
  subscribed: boolean;
}

/**
 * Subscribe to an AmarWave channel inside a component.
 * Automatically unsubscribes when the component unmounts or `channelName` changes.
 *
 * Must be used inside an `<AmarWaveProvider>`.
 *
 * @example
 * const { channel, subscribed } = useChannel('public-chat');
 *
 * useEffect(() => {
 *   channel?.bind('message', (data) => console.log(data));
 * }, [channel]);
 */
export function useChannel(channelName: string): ChannelHookResult {
  const client = useAmarWaveClient();
  const [subscribed, setSubscribed] = useState(false);
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    const ch = client.subscribe(channelName);
    channelRef.current = ch;

    if (ch.subscribed) setSubscribed(true);

    const onSubscribed = () => setSubscribed(true);
    ch.bind('subscribed', onSubscribed);

    return () => {
      ch.unbind('subscribed', onSubscribed);
      client.unsubscribe(channelName);
      channelRef.current = null;
      setSubscribed(false);
    };
  }, [client, channelName]);

  return { channel: channelRef.current, subscribed };
}
