import { type CheerioAPI, type Element, load } from 'cheerio'
import type { PluginOption } from 'vite'

const createQiankunHelper = (qiankunName: string) => `
  const createDeffer = (hookName) => {
    const d = new Promise((resolve, reject) => {
      window.proxy && (window.proxy[\`vite\${hookName}\`] = resolve)
    })
    return props => d.then(fn => fn(props));
  }
  const bootstrap = createDeffer('bootstrap');
  const mount = createDeffer('mount');
  const unmount = createDeffer('unmount');
  const update = createDeffer('update');
  ;(global => {
    global.qiankunName = '${qiankunName}';
    global['${qiankunName}'] = {
      bootstrap,
      mount,
      unmount,
      update
    };
  })(window);
`

/* const _replaceSomeScript = ($: CheerioAPI, findStr: string, replaceStr = '') => {
    $('script').each((i, el) => {
        if ($(el).html()?.includes(findStr)) {
            $(el).html(replaceStr)
        }
    })
} */

const createImportFinallyResolve = (qiankunName: string) => {
    return `
    const global_concurent_qiankun = window.proxy?.__GLOBAL_CONCURENT_QIANKUN__?.['${qiankunName}']
    if(global_concurent_qiankun){
        window.proxy = global_concurent_qiankun
    }
    const qiankunLifeCycle = window.moduleQiankunAppLifeCycles && window.moduleQiankunAppLifeCycles['${qiankunName}'];
    if (qiankunLifeCycle) {
      window.proxy.vitemount((props) => qiankunLifeCycle.mount(props));
      window.proxy.viteunmount((props) => qiankunLifeCycle.unmount(props));
      window.proxy.vitebootstrap(() => qiankunLifeCycle.bootstrap());
      window.proxy.viteupdate((props) => qiankunLifeCycle.update(props));
    }
  `
}

export type MicroOption = {
    useDevMode?: boolean
}

const createImport = (src: string, callback?: string) => {
    const appendBase = "(window.proxy ? (window.proxy?.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ + '..') : '') + "

    return `import(${appendBase}'${src}').then(${callback})`
}
type PluginFn = (qiankunName: string, microOption?: MicroOption) => PluginOption
const createEntry = (entryScript: string) => `
        let RefreshRuntime;
        window.$RefreshReg$ = () => {};
        window.$RefreshSig$ = () => (type) => type;
        window.__vite_plugin_react_preamble_installed__ = true;
        ${createImport(
            '/@react-refresh',
            `(module) => {
        RefreshRuntime=module.default
        RefreshRuntime.injectIntoGlobalHook(window)
        ${entryScript}
        }
        `,
        )}`
export const qiankun: PluginFn = (qiankunName, microOption = {}) => {
    let isProduction: boolean

    let base = ''

    const module2DynamicImport = ($: CheerioAPI, scriptTag: Element) => {
        if (!scriptTag) {
            return
        }

        const script$ = $(scriptTag)

        const moduleSrc = script$.attr('src')

        let appendBase = ''

        if (microOption.useDevMode && !isProduction) {
            appendBase = "(window.proxy ? (window.proxy?.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ + '..') : '') + "
        }

        script$.removeAttr('src')
        script$.removeAttr('type')
        script$.html(`import(${appendBase}'${moduleSrc}')`)
        return script$
    }

    return {
        name: 'qiankun-html-transform',
        configResolved(config) {
            isProduction = config.command === 'build' || config.isProduction
            base = config.base
        },

        configureServer(server) {
            return () => {
                server.middlewares.use((_req, res, next) => {
                    if (isProduction || !microOption.useDevMode) {
                        next()
                        return
                    }
                    const end = res.end.bind(res)
                    res.end = (...args: ((() => void) | undefined)[] | string[]) => {
                        let [htmlStr] = args
                        const [_, ...rest] = args
                        if (typeof htmlStr === 'string') {
                            const $ = load(htmlStr)
                            //const $ = load(htmlStr)

                            module2DynamicImport($, $(`script[src=${base}@vite/client]`).get(0)!)
                            //module2DynamicImport($, $('script[src=/@vite/client]').get(0))
                            const reactRefreshScript = $('script[type=module]')
                            //const reactRefreshScriptstr = reactRefreshScript.toString()
                            // console.log('==============reactRefreshScriptstr===============')
                            //console.log(reactRefreshScriptstr)
                            // console.log('==============reactRefreshScriptstr===============')
                            reactRefreshScript.removeAttr('type').empty()

                            const entryScript = $('#entry')

                            entryScript.html(createEntry(entryScript.html() as string))
                            // console.log('==============entryScript===============')
                            // console.log(entryScript.html())
                            // console.log('==============entryScript===============')

                            htmlStr = $.html()
                            // console.log('==============start===============')
                            //console.log(htmlStr)
                            //  console.log('================end===============')
                            //htmlStr = $.html()
                        }

                        return end(htmlStr, ...(rest as ((() => void) | undefined)[]))
                    }
                    next()
                })
            }
        },
        transformIndexHtml(html: string) {
            const $ = load(html)
            const moduleTags = $('body script[type=module], head script[crossorigin=""]')
            if (!moduleTags || !moduleTags.length) {
                return
            }
            const len = moduleTags.length
            moduleTags.each((i, moduleTag) => {
                const script$ = module2DynamicImport($, moduleTag)
                if (len - 1 === i) {
                    script$?.html(`${script$.html()}.finally(() => {
            ${createImportFinallyResolve(qiankunName)}
          })`)
                }
            })

            $('body').append(`<script>${createQiankunHelper(qiankunName)}</script>`)
            const output = $.html()
            return output
        },
    }
}
