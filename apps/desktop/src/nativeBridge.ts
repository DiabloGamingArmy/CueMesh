import { invoke } from '@tauri-apps/api/core';
import type { NativeBridge } from '@cuemesh/ui';

export const registerNativeBridge = () => {
  const bridge: NativeBridge = {
    playAudio: async (pathOrAssetId) => {
      await invoke('play_audio', { pathOrAssetId });
    },
    registerHotkeys: async (map) => {
      await invoke('register_hotkeys', { map });
    }
  };

  (window as Window & { __CUEMESH_NATIVE__?: NativeBridge }).__CUEMESH_NATIVE__ = bridge;
};
