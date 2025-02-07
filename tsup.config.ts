import {defineConfig} from 'tsup';
import {resolve} from 'path';

export default defineConfig({
    entry: {
        'cli/index': 'src/cli/index.ts',
        'core/index': 'src/core/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    treeshake: true,
    sourcemap: true,
    outDir: 'dist',
    target: 'node14',
    bundle: true,
    splitting: false,
    esbuildOptions(options) {
        options.alias = {
            '@cli': resolve(__dirname, './src/cli'),
            '@typing': resolve(__dirname, './src/types')
        }
    },
    outExtension({format}) {
        return {
            js: format === 'esm' ? '.js' : '.cjs'
        }
    }
});
