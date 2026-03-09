window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
window.__vite_plugin_react_preamble_installed__ = true;

export interface IRender {
  component_path?: string;
  occurrence?: number;
}
export interface IRenderProps extends QiankunProps, IRender {}

export interface QiankunProps {
  container?: HTMLElement;
  [x: string]: unknown;
}

export type QiankunLifeCycle = {
  bootstrap: () => void | Promise<void>;
  mount: (props: QiankunProps) => void | Promise<void>;
  unmount: (props: QiankunProps) => void | Promise<void>;
  update: (props: QiankunProps) => void | Promise<void>;
};
declare global {
  interface Window {
    $RefreshReg$: () => void;
    $RefreshSig$: () => <T>(type: T) => T;
    __vite_plugin_react_preamble_installed__: boolean;
    moduleQiankunAppLifeCycles?: Record<string, QiankunLifeCycle>;
    __GLOBAL_CONCURRENT_QIANKUN__?: Record<string, QiankunWindow>;
    __POWERED_BY_QIANKUN__?: boolean;
  }
}

export interface QiankunWindow {
  __POWERED_BY_QIANKUN__?: boolean;
  qiankunName?: string;
  proxy?: QiankunWindow;
  [x: string]: unknown;
}

export function generateQiankunHelpers(appName: string) {
  const qiankunWindow =
    typeof window !== "undefined"
      ? window.__GLOBAL_CONCURRENT_QIANKUN__?.[appName] ||
        window.proxy ||
        window
      : {};

  const renderWithQiankun = (qiankunLifeCycle: QiankunLifeCycle) => {
    // The function has only one chance to execute, and the life cycle needs to be assigned to the global
    if (qiankunWindow?.__POWERED_BY_QIANKUN__) {
      if (!window.moduleQiankunAppLifeCycles) {
        window.moduleQiankunAppLifeCycles = {};
      }

      if (`qiankunName` in qiankunWindow && qiankunWindow.qiankunName) {
        window.moduleQiankunAppLifeCycles[appName] = qiankunLifeCycle;
      }
    }
  };

  return {
    renderWithQiankun,
    qiankunWindow,
  };
}
