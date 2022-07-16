import React, { Component } from 'react'
import Item from '../Item'
import './index.css'
export default class List extends Component {
  render() {
    const {todos} = this.props
    // console.log(this.props);
    return (
      <div>
        <ul>
          {
            todos.map(todo => {
              // console.log(todo);
              return <Item key={todo.id} {...todo} />
            })
          }

        </ul>
      </div>
    )
  }
}
