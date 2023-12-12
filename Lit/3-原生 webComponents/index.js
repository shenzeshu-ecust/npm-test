 class PopupInfo extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        // 创建阴影根节点
        // mode: open: shadow root 元素可以从 js 外部访问根节点，例如使用 Element.shadowRoot:
        // closed 拒绝从 js 外部访问关闭的 shadow root 节点
        const shadow = this.attachShadow({ mode: 'open'})

        // 创建一个 span
        const wrapper = document.createElement('span')
        wrapper.setAttribute('class', 'wrapper')
        const icon = document.createElement('span')
        icon.setAttribute('class', 'icon')
        /*
          
  ~  tabindex=负值 (通常是 tabindex=“-1”)，表示元素是可聚焦的，但是不能通过键盘导航来访问到该元素，用 JS 做页面小组件内部键盘导航的时候非常有用。
  ~  tabindex="0" ，表示元素是可聚焦的，并且可以通过键盘导航来聚焦到该元素，它的相对顺序是当前处于的 DOM 结构来决定的。
  ~  tabindex=正值，表示元素是可聚焦的，并且可以通过键盘导航来访问到该元素；它的相对顺序按照tabindex 的数值递增而滞后获焦。如果多个元素拥有相同的 tabindex，它们的相对顺序按照他们在当前 DOM 中的先后顺序决定。

         */
        icon.setAttribute('tabindex', 0)

        const info = document.createElement('span')
        info.setAttribute('class', 'info')
        //  获取 text 属性的内容，赋值给 span 里
        const text = this.getAttribute('text')
        console.log(text)
        info.textContent = text

        let imgUrl
        if(this.hasAttribute('img')) {
            imgUrl = this.getAttribute('img')
        } else {
            imgUrl = 'https://cn.bing.com/images/search?view=detailV2&ccid=ekKJTGQ0&id=3D7772F6A8760746163EF97AB8E8CD6FBB8D02EC&thid=OIP.ekKJTGQ0H9alG_yhzndQNQHaGk&mediaurl=https%3a%2f%2fmedia.but.fr%2fimages_produits%2fproduit-zoom%2f3584174441243_D.jpg&exph=1704&expw=1920&q=Lit&simid=608054729901082975&FORM=IRPRST&ck=EDE80B494798458DAB68A3BF0C9F8709&selectedIndex=0'
        }

        const img = document.createElement('img')
        img.src = imgUrl
        icon.appendChild(img)

        const style = document.createElement('style')
        console.log(style.isConnected)

        style.textContent = `
        .wrapper {
          position: relative;
        }
  
        .info {
          font-size: 0.8rem;
          width: 200px;
          display: inline-block;
          border: 1px solid black;
          padding: 10px;
          background: white;
          border-radius: 10px;
          opacity: 0;
          transition: 0.6s all;
          position: absolute;
          bottom: 20px;
          left: 10px;
          z-index: 3;
        }
  
        img {
          width: 3rem;
        }
  
        .icon:hover + .info, .icon:focus + .info {
          opacity: 1;
        }
      `;

      shadow.appendChild(style)
      console.log(style.isConnected)
      shadow.appendChild(wrapper)
      wrapper.appendChild(icon)
      wrapper.appendChild(info)
        
    }
}

customElements.define('popup-info', PopupInfo)