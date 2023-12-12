class MyParagraph extends HTMLElement {
    constructor() {
        super()
        let template = document.getElementById('my-paragraph')
        let templateContent = template.content

        const shadowRoot = this.attachShadow({ mode: 'open'})
        // 关键是我们使用 Node.cloneNode() 方法添加了模板的拷贝到阴影的根结点上。
        shadowRoot.appendChild(templateContent.cloneNode(true))
    }
}

customElements.define('my-paragraph', MyParagraph)