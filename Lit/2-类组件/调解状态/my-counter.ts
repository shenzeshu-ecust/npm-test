import { html, LitElement} from 'lit'
import { customElement, property } from 'lit/decorators'
import { CounterButton } from './counter-button'
@customElement('my-counter')

export class MyCounter extends LitElement {
    @property({type: Number}) count = 0

    addToCounter(e: CustomEvent<{step: number}>) {
        this.count += e.detail.step
    }

    render() {
        return html`
        <div @update-counter="${this.addToCounter}">
            <h3>${this.count}</h3>
            <counter-button step="-1"></counter-button>
            <counter-button step="1"></counter-button>
        </div>`
    }
}