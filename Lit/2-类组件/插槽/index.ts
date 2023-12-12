import {html, LitElement} from 'lit'
import {customElement} from 'lit/decorators.js';

@customElement('my-com')
export default class MyCom extends LitElement {
    render() {
        return html`
        <article>
            <header>
                <slot name="headerChildren">
                    <p>
                         默认插槽内容：
                        This message will not be rendered when children are attached to this slot!
                    </p>
                </slot>
            </header>
            <section>
                <slot name="sectionChildren"></slot>
            </section>
            
        </article>`
    }
}
