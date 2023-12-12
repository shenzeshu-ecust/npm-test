import {html, LitElement } from 'lit'
import { customElement, query} from 'lit/decorators'

@customElement('my-input')
export class MyInput extends LitElement {
    @query('input') // Define the query
    inputEl!: HTMLInputElement;

    onButtonClick() {
        this.inputEl.focus()
    }

    render() {
        return html`
        <input type="text">
        <br>
        <button @click=${this.onButtonClick}>
            Click
        </button>
        `
    }
}
// 在 JavaScript 中，@query 和 @queryAll 修饰器分别执行 querySelector 和 querySelectorAll。以下是相当于 @query('input') inputEl!: HTMLInputElement; 的 JavaScript 代码
class InputCom extends LitElement {
    get inputEl() {
        return this.renderRoot.querySelector('input')
    }
    // ...
}