import {html, render} from 'lit';
const itemsToBuy = [
  html`<li>Bananas</li>`,
  html`<li>oranges</li>`,
  html`<li>apples</li>`,
];
const disabled = false;
const label = 'my label';
const myClass = 'my-class';

// ～ 是因为 attribute 标签属性值只能是 String 类型，其他类型需要进行序列化。在 LitElement 中，只需要在父组件模板的属性值前使用(.)操作符，这样子组件内部 properties 就可以正确序列化为目标类型。
const value = 'my value';

const input = html`<input
  ?disabled=${disabled}
  class="static-class ${myClass}"
  .value=${value}
  @click=${() => console.log('click')}
  @input=${e => console.log(e.target.value)}>`;

const element = html`
  <h1>Things to buy:</h1>
  <ol>
    ${itemsToBuy}
  </ol>${input}`;

render(
  element,
  document.getElementById('root')
);