import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
// 匹配到的文件默认是懒加载的，通过动态导入实现，并会在构建时分离为独立的 chunk。
const jsmodules = import.meta.glob('./jsmodule/*.tsx') // 导入文件夹内所有文件
console.log(import.meta.env.BASE_URL); // 公共基础路径
console.log(import.meta.env.MODE);
console.log(import.meta.env.VITE_SOME_KEY);


// import.meta.url 是一个 ESM 的原生功能，会暴露当前模块的 URL。将它与原生的 URL 构造器 组合使用，
// 在一个 JavaScript 模块中，通过相对路径我们就能得到一个被完整解析的静态资源 URL：
// const imgUrl =  new URL('./img.png', import.meta.url).href
// document.getElementById('img').src = imgUrl
function App() {
  const [count, setCount] = useState(0)
  for(const path in jsmodules) {
    jsmodules[path]().then(module => {
      console.log(path, module);
      
    })
  }
  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
