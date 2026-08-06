import React, { useEffect, useRef } from 'react';
import { AmarWave } from './AmarWave';
import { AmarWaveContext } from './hooks/useAmarWave';
import type { AmarWaveProviderProps } from './hooks/useAmarWave';

/**
 * Provides a shared AmarWave client to all child components.
 * Place near the root of your app so all screens can access it via hooks.
 *
 * @example
 * <AmarWaveProvider config={{ appKey: 'KEY', cluster: 'local' }}>
 *   <App />
 * </AmarWaveProvider>
 */
export function AmarWaveProvider({ config, children }: AmarWaveProviderProps) {
  const clientRef = useRef<AmarWave | null>(null);

  if (!clientRef.current) {
    clientRef.current = new AmarWave(config);
  }

  useEffect(() => {
    return () => {
      clientRef.current?.destroy();
      clientRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AmarWaveContext.Provider value={clientRef.current}>
      {children}
    </AmarWaveContext.Provider>
  );
}
