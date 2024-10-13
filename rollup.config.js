import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
    input: './steadyTimer.js',
    output: [{
        dir: 'lib',
        format: 'cjs',
        entryFileNames: '[name].cjs.js',
        sourcemap: false,
    },
    {
        dir: 'lib',
        format: 'esm',
        entryFileNames: '[name].esm.js',
        sourcemap: false,
    },
    {
        dir: 'lib',
        format: 'umd',
        entryFileNames: '[name].umd.js',
        name: 'FE_utils',// umd模块名称，相当于一个命名空间，会自动挂载到window下面
        sourcemap: false,
        plugins: [terser()],
    }],
    plugins: [
        resolve(),
    ]
};