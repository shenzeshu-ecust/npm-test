import React, { Component } from 'react'
import './index.css'
export default class Footer extends Component {
    checkAllOrNot = (e) => {
        // 需要根据checked的状态确定全部勾选还是全部取消勾选！
        this.props.checkAllOrNot(e.target.checked)
    }
    clearAllDone = () => {
        if(window.confirm("确认清除已完成选项？")) {
            this.props.clearAllDone()
        }
    }
    render() {
        const {todos} = this.props
        const doneCount = todos.reduce((pre, cur) => pre + (cur.done ? 1 : 0), 0)
        const total = todos.length
        return (
            <div className='todo-footer'>
                <label htmlFor="">
                    <input type="checkbox" name="" id="" checked={doneCount === total && total !== 0} onChange={this.checkAllOrNot}/>
                </label>
                <span className='done'>
                    <span>已完成 {doneCount}</span> / 全部 {total}
                </span>
                <button className='btn btn-danger' onClick={this.clearAllDone}>清除已完成</button>
            </div>
        )
    }
}
