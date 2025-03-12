import {defineConfig, Options} from 'tsup';
import {resolve} from 'path';
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
            '@typing': resolve(__dirname, './src/types'),
            '@core': resolve(__dirname, './src/core'),
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

const exports: Options = {
    ...common,
    entry: {
        'index': 'src/index.ts',
        'browser/index': 'src/browser/index.ts',
        'client/background': 'src/client/background.ts',
        'client/command': 'src/client/command.ts',
        'client/content': 'src/client/content.ts',
    },
    format: ['esm', 'cjs'],
    outExtension({format}) {
        return {
            js: format === 'esm' ? '.js' : '.cjs'
        }
    }
}

export default defineConfig([cli, exports]);
