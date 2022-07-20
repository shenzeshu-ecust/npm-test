import React, { Component } from 'react'
import {nanoid} from 'nanoid'
import './index.css'
import PropTypes from 'prop-types'
export default class Header extends Component {
  // 对接受的props进行：类型、必要性的限制
  static propTypes = {
    addTodo: PropTypes.func.isRequired
  }
  handleKeyUp = (e)=> {
    // console.log(this);
    const {keyCode, target} = e
    // 不是回车返回
    if(keyCode !== 13) return
    if(target.value.trim() === '') {
      alert('输入不能为空！')
      return
    }
    const todoObj = {
      id: nanoid(),
      name: target.value,
      done: false
    }
    console.log(this.props);
    this.props.addTodo(todoObj)
    // 回车后清空输入框
    target.value = ''
  }
  render() {
    return (
      <div className='todo-header'>
        <input onKeyUp={this.handleKeyUp} type="text" placeholder='输入任务，回车确认' />
      </div>
    )
  }
}
