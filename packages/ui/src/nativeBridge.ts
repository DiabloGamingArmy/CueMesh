export type NativeBridge = {
  playAudio: (pathOrAssetId: string) => Promise<void>;
  registerHotkeys: (map: Record<string, string>) => Promise<void>;
};

export const getNativeBridge = (): NativeBridge | null => {
  if (typeof window === 'undefined') return null;
  const bridge = (window as Window & { __CUEMESH_NATIVE__?: NativeBridge }).__CUEMESH_NATIVE__;
  return bridge ?? null;
};
