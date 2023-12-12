import React,{ Component } from 'react'
import './app.scss'
import cwx from '@/miniapp/cwx/cwx';

interface Props {
  children: React.ReactNode;
}

class App extends Component<Props> {

  onLaunch () {
    console.log('app launch')
  }

  componentDidShow () {
    console.log('app show')
  }

  componentDidHide () {
    console.log('app hide')
  }

  onError (res) {
    if (cwx.collectErrMsg) {
      cwx.collectErrMsg(res, "taro_onError");
    }
  }

  onUnhandledRejection (res) {
    if (cwx.collectErrMsg) {
      cwx.collectErrMsg(res, "taro_onUnhandledRejection");
    }
  }
  
  componentDidCatchError () {}

  // this.props.children 是将要会渲染的页面
  render () {
    return this.props.children
  }
}

export default App
