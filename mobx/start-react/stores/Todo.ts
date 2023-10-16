import { makeAutoObservable, observable, action } from "mobx";

class Todo {
  id = Math.random();
  title = "";
  finished = false;

  constructor(title) {
    makeAutoObservable(this, {
      title: observable,
      finished: observable,
      toggle: action,
    });
    this.title = title;
  }

  toggle() {
    this.finished = !this.finished;
  }
}
export default Todo;
