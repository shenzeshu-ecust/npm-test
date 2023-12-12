class Square extends HTMLElement {
      // Specify observed attributes so that
  // attributeChangedCallback will work
     static get observedAttributes() { return ['color', 'size']; }
    constructor() {
        super()


        const shadow = this.attachShadow({ mode: 'open'})

        const div = document.createElement('div')
        const style = document.createElement('style')
        shadow.appendChild(style)
        shadow.appendChild(div)
    }

    connectedCallback() {
        // ! 2  后发生
        console.log('connected callback')
        updateStyle(this)
        
    }
    disconnectedCallback() {
        console.log('disconnected callback');
        
    }
    adoptedCallback() {
        console.log('adopted callback');
        
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // !  1 先发生
        console.log('name, oldValue, newValue', name, oldValue, newValue);
        updateStyle(this)
        
    }
}

customElements.define('custom-square', Square)

function updateStyle(elem) {
    const shadow = elem.shadowRoot;
    shadow.querySelector("style").textContent = `
      div {
        width: ${elem.getAttribute("size")}px;
        height: ${elem.getAttribute("size")}px;
        background-color: ${elem.getAttribute("color")};
      }
    `;
    
  }
  