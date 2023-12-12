import { LitElement, html} from 'lit'

class WelcomeBanner extends LitElement {
    static get properties() {
        return {
            name: {
                type: String
            }
        }
    }
    constructor() {
        super();
        this.name = ''
    }
    render() {
        return html`<h1>Hello, ${this.name}!</h1>`
    }
}

customElements.define('welcome-banner', WelcomeBanner)