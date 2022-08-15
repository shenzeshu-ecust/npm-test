import logo from './logo.svg';
import './App.css';
import React from 'react'
import Counter from './component/UseReducer'
import WithMemo from './component/UseMemo'
import Parent from './component/UseCallback'
import TextInputWithFocusButton from './component/UseRef'
import FancyInput from './component/UseImperativeHandle';
import { useEffect, useRef } from 'react';
import {fakeNames} from './utils/fakeNames'
import { FilterList } from './component/UseTransition'
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
  // const fancyInputRef = useRef()
  // const focus = () => {
  //   fancyInputRef.current.focus()
  // }
  // useEffect(() => {
  //   focus()
  // })
  return (
    <div className="App">
      <header className="App-header">
        <Counter initialCount={100}/>

        <WithMemo/>

        <Parent/>

        <TextInputWithFocusButton/>

        {/* <FancyInput ref={fancyInputRef}/> */}
        <img src={logo} className="App-logo" alt="logo" />

        <ThemeContext.Provider value={themes.dark}>
          <Toolbar></Toolbar>
        </ThemeContext.Provider>
      </header>
      <footer className='App-footer'>
        <FilterList names={fakeNames}></FilterList>
      </footer>
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
