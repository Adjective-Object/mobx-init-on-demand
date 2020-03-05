// @ts-check
import rollupTypescriptPlugin from 'rollup-plugin-typescript2';
import rollupReplacePlugin from 'rollup-plugin-replace';
import { terser as rollupTerserPlugin } from 'rollup-plugin-terser';
import pkg from './package.json';

function getConfig({ isProd }) {
    const stub = isProd ? 'prod' : 'dev';
    return {
        input: 'src/index.ts',
        output: [
            {
                file: `dist/cjs/index.${stub}.js`,
                format: 'cjs',
            },
            {
                file: `dist/es/index.${stub}.js`,
                format: 'es',
            },
        ],
        external: [
            ...Object.keys(pkg.dependencies || {}),
            ...Object.keys(pkg.peerDependencies || {}),
        ],
        plugins: [
            rollupTypescriptPlugin({
                typescript: require('typescript'),
                useTsconfigDeclarationDir: true,
            }),
            isProd &&
                rollupReplacePlugin({
                    'process.env.NODE_ENV': JSON.stringify('production'),
                }),
            isProd &&
                rollupTerserPlugin({
                    mangle: {
                        toplevel: true,
                        properties: {
                            reserved: ['isMobXObservableMap'],
                        },
                    },
                }),
        ],
    };
}

export default [
    // Entrypoints for js and cjs
    {
        input: 'src/cjs-common-entrypoint.js',
        output: {
            file: 'dist/index.js',
            format: 'cjs',
        },
        external: ['./index.prod.js', './index.dev.js'],
    },
    // Actual build
    getConfig({
        isProd: false,
    }),
    getConfig({
        isProd: true,
    }),
];
