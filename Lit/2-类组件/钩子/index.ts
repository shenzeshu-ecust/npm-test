import { LitElement, html, } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ClockController } from './clock'

@customElement('my-element')
class MyElement extends LitElement {
    private readonly clock = new ClockController(this)

    render() {
        return html`
        <div>
            <p>it is ${this.clock.date.toLocaleTimeString()}</p>
        </div>`
    }
}