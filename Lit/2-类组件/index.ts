import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { styleMap} from 'lit/directives/style-map';
import MyCom from './插槽/index'


const ORANGE = css`orange`

@customElement('welcome-banner')
class WelcomeBanner extends LitElement {
  @property({type: String})
  static styles = [
    css`
    #orange {
      color: ${ORANGE}
    }

    #purple {
      color: rebeccapurple;
    }
    `
  ]
  color =  '#000'
  name = ''
  render() {
    const headerStyle = styleMap({
      'border-color': this.color,
    })
    return html`
    <h1 style="border-style: solid; border-width: 2px;${headerStyle}">Hello, this is ${this.name}</h1>
    <my-com>
      <h3 id="orange" slot="headerChildren">
        Extry
      </h3>
      <p id="purple" slot="sectionChildren">
      Children are composed with slots in Lit!
      </p>
    </my-com>

     <input type="color" @input=${e => (this.color = e.target.value)} value="#000"></input>
    `
  }
}