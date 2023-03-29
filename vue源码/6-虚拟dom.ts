// 1 什么是虚拟DOM
// 用一个JS对象来描述一个DOM节点
/*
  <div class="a" id="b">我是内容</div>

{
  tag:'div',        // 元素标签
  attrs:{           // 属性
    class:'a',
    id:'b'
  },
  text:'我是内容',  // 文本内容
  children:[]       // 子元素
}

 */

// 2 为啥用虚拟DOM
// 我们知道，Vue是数据驱动视图的，数据发生变化视图就要随之更新，在更新视图的时候难免要操作DOM,而操作真实DOM又是非常耗费性能的，这是因为浏览器的标准就把 DOM 设计的非常复杂，所以一个真正的 DOM 元素是非常庞大的
// 可以用JS的计算性能来换取操作DOM所消耗的性能。
// 我们可以用JS模拟出一个DOM节点，称之为虚拟DOM节点。当数据发生变化时，我们对比变化前后的虚拟DOM节点，通过DOM-Diff算法计算出需要更新的地方，然后去更新需要更新的视图。

// ! 3 VNode 类
// 通过这个类，我们就可以实例化出不同类型的虚拟DOM节点

// 源码位置：src/core/vdom/vnode.js

export default class VNode {
  constructor(
    tag?: string,
    data?: VNodeData,
    children?: Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag; /*当前节点的标签名*/
    this.data =
      data; /*当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息*/
    this.children = children; /*当前节点的子节点，是一个数组*/
    this.text = text; /*当前节点的文本*/
    this.elm = elm; /*当前虚拟节点对应的真实dom节点*/
    this.ns = undefined; /*当前节点的名字空间*/
    this.context = context; /*当前组件节点对应的Vue实例*/
    this.fnContext = undefined; /*函数式组件对应的Vue实例*/
    this.fnOptions = undefined;
    this.fnScopeId = undefined;
    this.key = data && data.key; /*节点的key属性，被当作节点的标志，用以优化*/
    this.componentOptions = componentOptions; /*组件的option选项*/
    this.componentInstance = undefined; /*当前节点对应的组件的实例*/
    this.parent = undefined; /*当前节点的父节点*/
    this.raw =
      false; /*简而言之就是是否为原生HTML或只是普通文本，innerHTML的时候为true，textContent的时候为false*/
    this.isStatic = false; /*静态节点标志*/
    this.isRootInsert = true; /*是否作为跟节点插入*/
    this.isComment = false; /*是否为注释节点*/
    this.isCloned = false; /*是否为克隆节点*/
    this.isOnce = false; /*是否有v-once指令*/
    this.asyncFactory = asyncFactory;
    this.asyncMeta = undefined;
    this.isAsyncPlaceholder = false;
  }

  get child(): Component | void {
    return this.componentInstance;
  }
}

// ! 4 VNode 的类型
/*
    注释节点
    文本节点
    元素节点
    组件节点
    函数式组件节点
    克隆节点
*/

// 1) 注释节点
// 它只需两个属性就够了
export const createEmptyVNode = (text: string = "") => {
  const node = new VNode();
  node.text = text;
  node.isComment = true;
  return node;
};

// 2) 文本节点
// 文本节点描述起来比注释节点更简单，因为它只需要一个属性，那就是text属性，用来表示具体的文本信息
// 创建文本节点
export function createTextVNode(val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val));
}

// 3）克隆节点
// ~ 克隆节点就是把一个已经存在的节点复制一份出来，它主要是为了做模板编译优化时使用，这个后面我们会说到
// 创建克隆节点
export function cloneVNode(vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  );
  cloned.ns = vnode.ns;
  cloned.isStatic = vnode.isStatic;
  cloned.key = vnode.key;
  cloned.isComment = vnode.isComment;
  cloned.fnContext = vnode.fnContext;
  cloned.fnOptions = vnode.fnOptions;
  cloned.fnScopeId = vnode.fnScopeId;
  cloned.asyncMeta = vnode.asyncMeta;
  cloned.isCloned = true;
  return cloned;
}
// ~ 从上面代码中可以看到，克隆节点就是把已有节点的属性全部复制到新节点中，而现有节点和新克隆得到的节点之间唯一的不同就是————克隆得到的节点isCloned为true。

// 4）元素节点
/*
相比之下，元素节点更贴近于我们通常看到的真实DOM节点，它有描述节点标签名词的tag属性，描述节点属性如class、attributes等的data属性，有描述包含的子节点信息的children属性等。
由于元素节点所包含的情况相比而言比较复杂，源码中没有像前三种节点一样直接写死（当然也不可能写死），那就举个简单例子说明一下：

*  真实DOM节点
<div id='a'><span>难凉热血</span></div>

*/

const vnode = {
  tag: "div",
  data: {},
  children: [
    {
      tag: "span",
      text: "难凉热血",
    },
  ],
};

// 5） 组件节点

/*
组件节点除了有元素节点具有的属性之外，它还有两个特有的属性：

    componentOptions :组件的option选项，如组件的props等
    componentInstance :当前组件节点对应的Vue实例

*/

// 6) 函数式组件节点
/*
函数式组件节点相较于组件节点，它又有两个特有的属性：

    fnContext:函数式组件对应的Vue实例
    fnOptions: 组件的option选项
*/

// ! 5 VNode的作用
/*
    我们在视图渲染之前，把写好的template模板先编译成VNode并缓存下来，
    等到数据发生变化页面需要重新渲染的时候，我们把数据发生变化后生成的VNode与前一次缓存下来的VNode进行对比，找出差异，
    然后有差异的VNode对应的真实DOM节点就是需要重新渲染的节点，
    最后根据有差异的VNode创建出真实的DOM节点再插入到视图中，最终完成一次视图更新。

*/

// ! 6 创建节点
/*
在上篇文章中我们分析了，VNode类可以描述6种类型的节点，
~ 而实际上只有3种类型的节点能够被创建并插入到DOM中，它们分别是：元素节点、文本节点、注释节点。

~ 所以Vue在创建节点的时候会判断在新的VNode中有而旧的oldVNode中没有的这个节点是属于哪种类型的节点，从而调用不同的方法创建并插入到DOM中。

其实判断起来也不难，因为这三种类型的节点其特点非常明显，在源码中是怎么判断的：
*/

// 源码位置: /src/core/vdom/patch.js
function createElm(vnode, parentElm, refElm) {
  const data = vnode.data;
  const children = vnode.children;
  const tag = vnode.tag;

  if (isDef(tag)) {
    vnode.elm = nodeOps.createElement(tag, vnode); // 创建元素节点
    createChildren(vnode, children, insertedVnodeQueue); // 创建元素节点的子节点
    insert(parentElm, vnode.elm, refElm); // 插入到DOM中
  } else if (isTrue(vnode.isComment)) {
    vnode.elm = nodeOps.createComment(vnode.text); // 创建注释节点
    insert(parentElm, vnode.elm, refElm);
  } else {
    vnode.elm = nodeOps.createTextNode(vnode.text); // 创建文本节点
    insert(parentElm, vnode.elm, refElm);
  }
}
/*
    1 判断是否为元素节点只需判断该VNode节点是否有tag标签即可。
        如果有tag属性即认为是元素节点，则调用createElement方法创建元素节点.
        通常元素节点还会有子节点，那就递归遍历创建所有子节点，将所有子节点创建好之后insert插入到当前元素节点里面，
        最后把当前元素节点插入到DOM中。
    2 判断是否为注释节点，只需判断VNode的isComment属性是否为true即可，
        若为true则为注释节点，则调用createComment方法创建注释节点，
        再插入到DOM中。
    3 如果既不是元素节点，也不是注释节点，那就认为是文本节点，
        则调用createTextNode方法创建文本节点，
        再插入到DOM中。

*/

// 代码中的nodeOps是Vue为了跨平台兼容性，对所有节点操作进行了封装，例如nodeOps.createTextNode()在浏览器端等同于document.createTextNode()

const nodeOps = {
  createElement: document.createElement,
  createComment: document.createComment,
  createTextNode: document.createTextNode,
  removeChild: (parent, el) => parent.removeChild(el),
  parentNode: (el) => el.parentNode,
};

function isDef(tag: any) {
  return true;
}
function isTrue(isComment) {
  return true;
}
function insert(parentElm, elm, refElm) {}

function createChildren(vnode, children, queue) {}

// ! 7 删除节点
function removeNode(el) {
  const parent = nodeOps.parentNode(el); // 获取父节点
  if (isDef(parent)) {
    nodeOps.removeChild(parent, el); // 调用父节点的removeChild方法
  }
}
