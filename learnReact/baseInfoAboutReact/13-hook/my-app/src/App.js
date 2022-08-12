import logo from './logo.svg';
import './App.css';
import React from 'react'
import Counter from './component/UseReducer'
import WithMemo from './component/UseMemo'
const themes = {
  light: {
    foreground: "#000000",
    background: "#eeeeee"
  },
  dark: {
    foreground: "#ffffff",
    background: "#222222"
  }
}
// ! 当组件上层最近的 <MyContext.Provider> 更新时，该 Hook 会触发重渲染，并使用最新传递给 MyContext provider 的 context value 值。
// ! 即使祖先使用 React.memo 或 shouldComponentUpdate，也会在组件本身使用 useContext 时重新渲染。
const ThemeContext = React.createContext(themes.light)

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <Counter initialCount={100}/>

        <WithMemo/>

        <img src={logo} className="App-logo" alt="logo" />

        <ThemeContext.Provider value={themes.dark}>
          <Toolbar></Toolbar>
        </ThemeContext.Provider>
      </header>

    </div>
  );
}
function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  const theme = React.useContext(ThemeContext);
  return (
    <button style={{ background: theme.background, color: theme.foreground }}>
      I am styled by theme context!
    </button>
  );
}
export default App;
