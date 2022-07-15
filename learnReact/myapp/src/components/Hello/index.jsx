import react, {Component} from 'react'
// * 样式的模块化： css文件加入module 并且 按如下方式引入，可以避免同名css样式冲突覆盖
import  helloCSS from './index.module.css'
// import './index.css'
export default class Hello extends Component {
    render() {
        return (
            <h1 className={helloCSS.hello}>hello ! react</h1>
        )
    }
}