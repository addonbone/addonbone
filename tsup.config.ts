import {defineConfig, Options} from 'tsup';
import {resolve} from 'path';

const common: Options = {
    dts: true,
    clean: true,
    treeshake: true,
    sourcemap: true,
    outDir: 'dist',
    target: 'node14',
    bundle: true,
    splitting: false,
    external: [/^node_modules/,],
    esbuildOptions(options) {
        options.alias = {
            '@cli': resolve(__dirname, './src/cli'),
            '@typing': resolve(__dirname, './src/types'),
            '@core': resolve(__dirname, './src/core'),
        }
    },
}

const cli: Options = {
    ...common,
    entry: {
        'cli/index': 'src/cli/index.ts',
    },
    dts: false,
    format: ['cjs'],
    outExtension: () => ({js: '.cjs'}),
}

const exports: Options = {
    ...common,
    entry: {
        'index': 'src/index.ts',
    },
    format: ['esm', 'cjs'],
    outExtension({format}) {
        return {
            js: format === 'esm' ? '.js' : '.cjs'
        }
    }
}

export default defineConfig([cli, exports]);
