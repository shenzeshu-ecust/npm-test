import React, { Component } from 'react'
import './index.css'
export default class Item extends Component {
  state = { mouse: false } // 标识 鼠标移入移出的回调
  handleMouse = (flag) => {
    // onXXX={this.handle(a)}  由于是传参函数，所以需要 返回值是一个函数。否则直接执行了而不是根据情况触发
    return () => {
      this.setState({ mouse: flag })
    }
  }
  handleChange = (id) => {
    return (event) => {
      // console.log(id, event.target.checked);
      this.props.updateTodo(id, event.target.checked)
    }
  }
  handleDelete = (id) => {
    if(window.confirm('确认删除吗')) {
      // 若 点击了确认-确认删除，就调用爷爷组件传过来的方法
      console.log(this.props);
      this.props.deleteTodo(id)
    }
  }
  render() {
    // console.log(this.props);
    const { id, done, name } = this.props
    const { mouse } = this.state
    return (
      <li style={{ backgroundColor: mouse ? '#ccc' : '#fff' }} onMouseEnter={this.handleMouse(true)} onMouseLeave={this.handleMouse(false)}>
        <label htmlFor="">
          <input type="checkbox" name="" id="" checked={done} onChange={this.handleChange(id)}/>
          <span>{name}</span>
        </label>
        {/* 不使用柯里化方式 传带参数的函数 */}
        <button className='btn btn-danger' style={{ display: mouse ? 'block' : 'none' }} onClick={() => {this.handleDelete(id)}}>删除</button>
      </li>
    )
  }
}
