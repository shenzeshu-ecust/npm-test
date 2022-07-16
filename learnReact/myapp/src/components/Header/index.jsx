import React, { Component } from 'react'
import './index.css'
export default class Header extends Component {
  render() {
    return (
      <div className='todo-header'>
        <input type="text" placeholder='输入任务，回车确认' />
      </div>
    )
  }
}
