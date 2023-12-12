const template = document.querySelector('#caiBtn')
class CaiButton extends HTMLElement {
    constructor() {
        super()
        this._type = {
            primary: 'cai-button',
            warning: 'cai-button-warning',
            danger: 'cai-button-danger',
        }
        const shadow = this.attachShadow({ mode: 'open'})
        const type = this.getAttribute('type')
        const content = template.content.cloneNode(true)
        this._btn = content.querySelector('.cai-button')
        this._btn.className += ` ${this._type[type]}`
        shadow.appendChild(content)
    }

    static get observedAttributes() { return ['type']; }

    attributeChangedCallback(name, oldValue, newValue) {
        this[name] = newValue
        this.render()
        
    }

    render() {
        this._btn.className = `cai-button ${this._type[this.type]}`
    }
}

customElements.define('cai-button', CaiButton)