import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import image from '@rollup/plugin-image'
import typescript2 from 'rollup-plugin-typescript2'
import { resolve } from 'path'
import path from 'path'
// https://vitejs.dev/config/
//  vite 执行 “依赖 预构建” 目的有2
// 1 vite将所有commonjs或者UMD发布的依赖转换为 ESM
// 2 将有多个内部模块的ESM依赖关系转换为单个模块，提高后续页面加载性能。减少了http请求
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    {
      ...image(),
      enforce: 'pre'
      // pre: 在 Vite 核心插件之前 调用该插件
      // 默认：在 Vite 核心插件之后 调用该插件
      // post：在 Vite 构建插件之后 调用该插件
    },
    {
      ...typescript2(),
      // 默认情况下插件在开发 (serve) 和生产 (build) 模式中都会调用。
      // 如果插件在服务或构建期间按需使用，请使用 apply 属性指明它们仅在 'build' 或 'serve' 模式时调用：
      apply: 'build'
    }
  ],
  optimizeDeps: {
    // 如果依赖项很大（包含很多内部模块）或者是 CommonJS，那么你应该包含它；
    // 如果依赖项很小，并且已经是有效的 ESM，则可以排除它，让浏览器直接加载它。
    // CommonJS 的依赖不应该排除在优化外。如果一个 ESM 依赖被排除在优化外，
    // 但是却有一个嵌套的 CommonJS 依赖，则应该为该 CommonJS 依赖添加 optimizeDeps.include
    include: [],
    // 在预构建中强制排除的依赖项。
    exclude: []
  },
  // 常见的图像、媒体和字体文件类型被自动检测为资源。你可以使用 assetsInclude 选项 扩展内部列表。
  assetsInclude: ['**/*.gltf'],
  // publicDir:''
  build: { // 发布构建配置
    target: 'modules', // 默认项， 指的是 支持原生ES模块的 浏览器；还有esnext（假设有原生动态导入支持，并且将会转译得尽可能小）...
    outDir: 'dist', // 默认
    watch: {},
    lib: {
      entry: path.resolve(__dirname, 'lib/main.js'), // 开发的库 必须指定入口文件。因为你它不能用html文件作为入口
      name: 'Mylib', // name 则是暴露的全局变量，在 formats 包含 'umd' 或 'iife' 时是必须的。
      formats: ['cjs', 'es'], // 默认 formats 是 ['es', 'umd'] 。
      fileName: (format) => `my-lib.${format}.js` // fileName 是输出的包文件名，默认 fileName 是 package.json 的 name 选项
    },
    rollupOptions: {
      input: { // 多页面应用
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html')

      },
      external: 'vue',  //  排除不想打包进库的依赖
      output: {
        // 在UMD构建模式下为这些外部的依赖提供一个全局变量
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
