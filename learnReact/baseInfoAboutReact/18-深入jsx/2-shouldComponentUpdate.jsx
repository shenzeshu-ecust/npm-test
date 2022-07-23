// 如果你的组件只有当 props.color 或者 state.count 的值改变才需要更新时，你可以使用 shouldComponentUpdate 来进行检查：
class CounterButton extends React.Component {
    constructor(props) {
      super(props);
      this.state = {count: 1};
    }
  
    shouldComponentUpdate(nextProps, nextState) {
      if (this.props.color !== nextProps.color) {
        return true;
      }
      if (this.state.count !== nextState.count) {
        return true;
      }
      return false;
    }
  
    render() {
      return (
        <button
          color={this.props.color}
          onClick={() => this.setState(state => ({count: state.count + 1}))}>
          Count: {this.state.count}
        </button>
      );
    }
  }
//   React 已经提供了一位好帮手来帮你实现这种常见的模式 - 你只要继承 React.PureComponent 就行了。所以这段代码可以改成以下这种更简洁的形式：
class CounterButton extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = {count: 1};
    }
  
    render() {
      return (
        <button
          color={this.props.color}
          onClick={() => this.setState(state => ({count: state.count + 1}))}>
          Count: {this.state.count}
        </button>
      );
    }
  }

  // 大部分情况下，你可以使用 React.PureComponent 来代替手写 shouldComponentUpdate。
//   但它只进行浅比较，所以当 props 或者 state 某种程度是可变的话，浅比较会有遗漏，那你就不能使用它了。当数据结构很复杂时，情况会变得麻