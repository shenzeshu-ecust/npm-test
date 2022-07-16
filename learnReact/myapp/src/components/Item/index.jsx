import React, { Component } from 'react'
import  './index.css'
export default class Item extends Component {
  render() {
    // console.log(this.props);
    const {done, name} = this.props
    return (
      <li>
        <label htmlFor="">
          <input type="checkbox" name="" id="" defaultChecked={done}/>
          <span>{name}</span>
        </label>
        <button className='btn btn-danger' style={{ display: 'none' }}>删除</button>
      </li>
    )
  }
}
