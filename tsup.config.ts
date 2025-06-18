import {resolve} from 'path';
import {defineConfig, Options} from 'tsup';
import rawPlugin from 'esbuild-plugin-raw';

const common: Options = {
    dts: true,
    clean: true,
    treeshake: true,
    sourcemap: true,
    outDir: 'dist',
    target: 'node14',
    bundle: true,
    splitting: false,
    //@ts-ignore
    esbuildPlugins: [rawPlugin()],
    external: [/^node_modules/],
    esbuildOptions(options) {
        options.alias = {
            '@browser': resolve(__dirname, './src/browser'),
            '@cli': resolve(__dirname, './src/cli'),
            '@entry': resolve(__dirname, './src/entry'),
            '@locale': resolve(__dirname, './src/locale'),
            '@main': resolve(__dirname, './src/main'),
            '@message': resolve(__dirname, './src/message'),
            '@service': resolve(__dirname, './src/service'),
            '@relay': resolve(__dirname, './src/relay'),
            '@typing': resolve(__dirname, './src/types'),
        }
    },
}

const cli: Options = {
    ...common,
    entry: {
        'cli/index': 'src/cli/index.ts'
    },
    dts: false,
    format: ['cjs'],
    outExtension: () => ({js: '.cjs'}),
}

const framework: Options = {
    ...common,
    entry: {
        'index': 'src/index.ts',

        'browser/index': 'src/browser/index.ts',

        'locale/index': 'src/locale/index.ts',
        'locale/react/index': 'src/locale/react/index.ts',

        'message/index': 'src/message/index.ts',
        'message/react/index': 'src/message/react/index.ts',

        'offscreen/index': 'src/offscreen/index.ts',

        'storage/index': 'src/storage/index.ts',
        'storage/react/index': 'src/storage/react/index.ts',

        'service/index': 'src/service/index.ts',

        'support/index': 'src/support/index.ts',

        'relay/index': 'src/relay/index.ts',

        'entry/background/index': 'src/entry/background/index.ts',

        'entry/command/index': 'src/entry/command/index.ts',

        'entry/content/index': 'src/entry/content/index.ts',
        'entry/content/vanilla/index': 'src/entry/content/vanilla/index.ts',
        'entry/content/react/index': 'src/entry/content/react/index.ts',

        'entry/service/index': 'src/entry/service/index.ts',
        'entry/transport/index': 'src/entry/transport/index.ts',

        'entry/offscreen/vanilla/index': 'src/entry/offscreen/vanilla/index.ts',
        'entry/offscreen/react/index': 'src/entry/offscreen/react/index.ts',

        'entry/relay/vanilla/index': 'src/entry/relay/vanilla/index.ts',
        'entry/relay/react/index': 'src/entry/relay/react/index.ts',

        'entry/view/index': 'src/entry/view/index.ts',
        'entry/view/vanilla/index': 'src/entry/view/vanilla/index.ts',
        'entry/view/react/index': 'src/entry/view/react/index.ts',
    },
    format: ['esm', 'cjs'],
    outExtension({format}) {
        return {
            js: format === 'esm' ? '.js' : '.cjs'
        }
    },
}

export default defineConfig([cli, framework]);
