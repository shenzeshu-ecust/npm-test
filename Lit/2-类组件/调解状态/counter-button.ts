import { html, LitElement} from 'lit'
import { customElement, property } from 'lit/decorators'

@customElement('counter-button')
export  class CounterButton extends LitElement {
    @property({type: Number}) step: number = 0;
    // 浏览器事件从子元素向上冒泡到父元素。事件允许子元素广播互动事件和状态更改。
    onClick() {
        // 分派名为 update-counter 并携带元素的 step 值的自定义事件
        const event = new CustomEvent('update-counter', {
            bubbles: true,
            detail: {
                step: this.step
            }
        })
        this.dispatchEvent(event)
    }

    render() {
        const label = this.step < 0 ? `- ${-1 * this.step}` : `+ ${this.step}`
        return html`<button @click=${this.onClick}>${label}</button>`
    }
}