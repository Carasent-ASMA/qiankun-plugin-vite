# Overview

> vite-plugin-qiankun: a Vite plugin that helps applications integrate with Qiankun quickly.

- Preserves the advantages of Vite building ES modules
- One-step configuration without affecting the existing Vite setup
- Supports the Vite development environment

## Quick Start

### 1. Install the plugin in `vite.config.ts`

```typescript
// vite.config.ts

import { qiankun } from 'asma-qiankun-plugin-vite';

export default {
  // 'myMicroAppName' is the micro-app name and must match the AppName used by the host app
  plugins: [qiankun('myMicroAppName')],
  // In production, set the deployment domain as the base
  base: 'http://xxx.com/'
}
```

### 2. Add the Qiankun lifecycle configuration in the entry file

```typescript
// main.ts
import {
  generateQiankunHelpers,
} from 'asma-qiankun-plugin-vite/helper';

const { renderWithQiankun, qiankunWindow } = generateQiankunHelpers('myMicroAppName');

// some code
renderWithQiankun({
  mount(props) {
    console.log('mount');
    render(props);
  },
  bootstrap() {
    console.log('bootstrap');
  },
  unmount(props: any) {
    console.log('unmount');
    const { container } = props;
    const mountRoot = container?.querySelector('#root');
    ReactDOM.unmountComponentAtNode(
      mountRoot || document.querySelector('#root'),
    );
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}
```

### 3. Debug as a micro-app in development

> When running as a micro-app in development, there is a conflict with the hot-reload plugin, and possibly with other plugins that modify HTML, so an extra debug configuration is required.

```typescript
// useDevMode conflicts with the hot-reload plugin when enabled, so switch it with a variable
const useDevMode = true

const baseConfig: UserConfig = {
  plugins: [
    ...(
      useDevMode ? [] : [
        reactRefresh()
      ]
    ),
    qiankun('viteapp', {
      useDevMode
    })
  ],
}
```

In the example above, `useDevMode = true` disables the hot-reload plugin, while `useDevMode = false` enables hot reload but prevents the app from loading as a micro-app.

### 4. Other notes for using `qiankunWindow`

Because ES module loading has some conflicts with how `qiankun` works, micro-apps implemented with this plugin do not run inside the JavaScript sandbox. If you must assign properties on `window`, explicitly operate on the Qiankun sandbox whenever possible. Otherwise, you may introduce side effects for other micro-apps. Example sandbox usage:

```typescript
import {
  generateQiankunHelpers,
} from 'asma-qiankun-plugin-vite/helper';

const { qiankunWindow } = generateQiankunHelpers('myMicroAppName');

qiankunWindow.customxxx = 'ssss'

if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('I am running as a micro-app')
}

```

## Examples

For more details, refer to the usage examples.

```bash
git clone xx
pnpm install
pnpm run example:install
# Production debug demo
pnpm run example:start
# Vite development demo, hot reload is disabled in this demo
pnpm run example:start-vite-dev
```


