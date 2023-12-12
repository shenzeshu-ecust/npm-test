import { html, LitElement, PropertyValueMap } from 'lit'
import { customElement, state } from 'lit/decorators.js'
@customElement('lit-clock')
class LitClock extends LitElement {
    @state()
    private date = new Date();
    private timerId = -1;
    connectedCallback() {
        super.connectedCallback();
        this.timerId = setInterval(() => this.tick(), 1000)
    }

    tick() {
        this.date = new Date();
    }
    render() {
        return html`
            <div>
                <h1>Hello</h1>
                <h2>It is ${this.date.toLocaleTimeString()}</h2>
            </div>
        `
    }
    protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        
    }
   

    disconnectedCallback() {
        super.disconnectedCallback();
        clearInterval(this.timerId)
    }
    
}