import React, { Component } from "react";
import Header from "./components/Header";
import List from "./components/List";
import Footer from "./components/Footer";
import "./App.css";
import { array } from "prop-types";
export default class App extends Component {
  // 初始化状态
  state = {
    todos: [
      { id: "001", name: "吃饭", done: true },
      { id: "002", name: "睡觉", done: true },
      { id: "003", name: "打代码", done: false },
      { id: "004", name: "逛街", done: false },
    ],
  };
  addTodo = (todoObj) => {
    const { todos } = this.state;
    const newTodos = [todoObj, ...todos];
    this.setState({ todos: newTodos });
  };
  updateTodo = (id, done) => {
    // 获取状态中的todos
    const { todos } = this.state;
    const newTodos = todos.map((todo) => {
      if (todo.id === id)
        return { ...todo, done }; // 用新的传过来的done:done 覆盖原来的旧值
      else return todo;
    });
    this.setState({ todos: newTodos });
  };
  deleteTodo = (id) => {
    const { todos } = this.state;
    const newTodos = todos.filter((todo) => {
      return todo.id !== id;
    });
    this.setState({ todos: newTodos });
  };
  checkAllOrNot = (done) => {
    const { todos } = this.state;
    const newTodos = todos.map((todo) => {
      return { ...todo, done };
    });
    this.setState({ todos: newTodos });
  };
  clearAllDone = () => {
    const { todos } = this.state;
    const newTodos = todos.filter((todo) => {
      return !todo.done;
    });
    this.setState({ todos: newTodos });
  };
  render() {
    const { todos } = this.state;
    return (
      <div className="todo-box">
        <Header addTodo={this.addTodo}></Header>
        <List
          todos={todos}
          updateTodo={this.updateTodo}
          deleteTodo={this.deleteTodo}
        ></List>
        <Footer
          todos={todos}
          checkAllOrNot={this.checkAllOrNot}
          clearAllDone={this.clearAllDone}
        ></Footer>
      </div>
    );
  }
}
