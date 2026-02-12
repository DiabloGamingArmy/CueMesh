type ScriptMeta = {
  src: string;
  type: string;
  noModule: boolean;
  async: boolean;
  defer: boolean;
  crossOrigin: string;
  referrerPolicy: string;
};

type ProbeError = {
  kind: 'error' | 'unhandledrejection';
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  time: string;
};

type ProbeEvent = {
  time: string;
  meta: ScriptMeta;
  highlighted: boolean;
};

const MAX_EVENTS = 20;

const reportState: {
  scripts: ProbeEvent[];
  errors: ProbeError[];
} = {
  scripts: [],
  errors: []
};

const pushLimited = <T,>(list: T[], next: T) => {
  list.unshift(next);
  if (list.length > MAX_EVENTS) list.pop();
};

const getScriptMeta = (script: HTMLScriptElement): ScriptMeta => ({
  src: script.src || '(inline)',
  type: script.type || '(none)',
  noModule: (script as HTMLScriptElement & { noModule?: boolean }).noModule ?? false,
  async: script.async,
  defer: script.defer,
  crossOrigin: script.crossOrigin ?? '',
  referrerPolicy: script.referrerPolicy ?? ''
});

const isHighlighted = (meta: ScriptMeta) => {
  const lowerSrc = meta.src.toLowerCase();
  const looksLikeReporter = lowerSrc.includes('content_reporter');
  const noTypeModule = meta.src.endsWith('.js') && meta.type !== 'module';
  return looksLikeReporter || noTypeModule;
};

const logScript = (meta: ScriptMeta) => {
  const highlighted = isHighlighted(meta);
  const event: ProbeEvent = {
    time: new Date().toISOString(),
    meta,
    highlighted
  };
  pushLimited(reportState.scripts, event);
  if (highlighted) {
    console.warn('[CueMesh] Suspicious script detected', meta);
  } else {
    console.info('[CueMesh] Script detected', meta);
  }
};

const logError = (payload: ProbeError) => {
  pushLimited(reportState.errors, payload);
  console.warn('[CueMesh] Runtime error', payload);
};

export const getScriptProbeReport = () => ({
  generatedAt: new Date().toISOString(),
  scripts: [...reportState.scripts],
  errors: [...reportState.errors]
});

const isEnabled = () => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('debugScripts') === '1') return true;
  return window.localStorage.getItem('cuemesh-debug-scripts') === '1';
};

export const installScriptProbe = () => {
  if (!isEnabled()) return;

  const snapshot = Array.from(document.scripts).map(getScriptMeta);
  console.groupCollapsed('[CueMesh] Script snapshot');
  console.table(snapshot);
  console.groupEnd();

  snapshot.forEach((meta) => logScript(meta));

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLScriptElement) {
          logScript(getScriptMeta(node));
        }
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('error', (event) => {
    const error = event.error as Error | undefined;
    logError({
      kind: 'error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: error?.stack,
      time: new Date().toISOString()
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason as Error | string | undefined;
    logError({
      kind: 'unhandledrejection',
      message: typeof reason === 'string' ? reason : reason?.message ?? 'Unhandled rejection',
      stack: typeof reason === 'string' ? undefined : reason?.stack,
      time: new Date().toISOString()
    });
  });

  const originalCreateElement = document.createElement.bind(document);
  document.createElement = ((tagName: string, options?: ElementCreationOptions) => {
    const element = originalCreateElement(tagName, options) as HTMLElement;
    if (tagName.toLowerCase() !== 'script') return element;

    const script = element as HTMLScriptElement;
    const descriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
    const originalSet = descriptor?.set?.bind(script);

    if (originalSet) {
      Object.defineProperty(script, 'src', {
        set(value) {
          originalSet(value);
          logScript(getScriptMeta(script));
        },
        get() {
          return script.getAttribute('src') ?? '';
        }
      });
    }

    return script as unknown as HTMLElement;
  }) as typeof document.createElement;
};
