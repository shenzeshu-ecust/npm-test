// ! 1 patch
// 在Vue中，把 DOM-Diff过程叫做patch过程。patch,意为“补丁”，即指对旧的VNode修补，打补丁从而得到新的VNode
/*
整个patch无非就是干三件事：

    创建节点：新的VNode中有而旧的oldVNode中没有，就在旧的oldVNode中创建。
    删除节点：新的VNode中没有而旧的oldVNode中有，就从旧的oldVNode中删除。
    更新节点：新的VNode和旧的oldVNode中都有，就以新的VNode为准，更新旧的oldVNode。
*/

// ! 2 创建节点
/*

    VNode类可以描述6种类型的节点
   ~ 而实际上只有3种类型的节点能够被创建并插入到DOM中，它们分别是：元素节点、文本节点、注释节点。
   ~ 所以Vue在创建节点的时候会判断在新的VNode中有而旧的oldVNode中没有的这个节点是属于哪种类型的节点，从而调用不同的方法创建并插入到DOM中。
*/

// 源码位置: /src/core/vdom/patch.js
function createElm(vnode, parentElm, refElm) {
  const data = vnode.data;
  const children = vnode.children;
  const tag = vnode.tag;
  if (isDef(tag)) {
    vnode.elm = nodeOps.createElm(tag, vnode); // 创建元素节点
    createChildren(vnode, children, insertedVnodeQueue); // 创建元素节点的子节点
    insert(parentElm, vnode.elm, refElm); // 插入到Dom中
  } else if (isTrue(vnode.isComment)) {
    vnode.elm = nodeOps.createComment(vnode.text); // 创建注释节点
    insert(parentElm, vnode.elm, refElm);
  } else {
    vnode.elm = nodeOps.createTextNode(vnode.text); // 创建文本节点
    insert(parentElm, vnode.elm, refElm);
  }
}

// 代码中的nodeOps是Vue为了跨平台兼容性，对所有节点操作进行了封装，例如nodeOps.createTextNode()在浏览器端等同于document.createTextNode()

/*
    1 判断是否为元素节点只需判断该VNode节点是否有tag标签即可。如果有tag属性即认为是元素节点，则调用createElement方法创建元素节点，
        通常元素节点还会有子节点，那就递归遍历创建所有子节点，将所有子节点创建好之后insert插入到当前元素节点里面，最后把当前元素节点插入到DOM中。
    2 判断是否为注释节点，只需判断VNode的isComment属性是否为true即可，若为true则为注释节点，则调用createComment方法创建注释节点，再插入到DOM中。
    3 如果既不是元素节点，也不是注释节点，那就认为是文本节点，则调用createTextNode方法创建文本节点，再插入到DOM中。
*/

// ! 3 删除节点
// 删除节点非常简单，只需在要删除节点的父元素上调用removeChild方法即可

function removeNode(el) {
  const parent = nodeOps.parentNode(el);
  if (isDef(parent)) {
    nodeOps.removeChild(parent, el); // 调用父节点的removeChild方法
  }
}

// ! 4 更新节点

// 前置概念：
// 静态节点：不管数据再怎么变化，只要这个节点第一次渲染了，那么它以后就永远不会发生变化，这是因为它不包含任何变量，所以数据发生任何变化都与它无关。
// 比如： <p>我是不会变化的文字</p>

/* 
  3种情况 
  
 ~ 1 如果VNode和oldVNode均为静态节点
      我们说了，静态节点无论数据发生任何变化都与它无关，所以都为静态节点的话则直接跳过，无需处理。

 ~ 2 如果VNode是文本节点
      如果VNode是文本节点即表示这个节点内只包含纯文本，那么只需看oldVNode是否也是文本节点，
      * ①是文本节点：那就比较两个文本是否不同，
        如果不同则把oldVNode里的文本改成跟VNode的文本一样。
      * ② 如果oldVNode不是文本节点，
        那么不论它是什么，直接调用setTextNode方法把它改成文本节点，并且文本内容跟VNode相同。

 ~ 3如果VNode是元素节点
      如果VNode是元素节点，则又细分以下两种情况：  
      * ① 该节点包含子节点
        此时要看旧的节点是否包含子节点，如果旧的节点里也包含了子节点，那就需要递归对比更新子节点；
        如果旧的节点里不包含子节点，那么这个旧节点有可能是空节点或者是文本节点，
          · 如果旧的节点是【空节点】，就把新的节点里的子节点创建一份然后插入到旧的节点里面，
          · 如果旧的节点是【文本节点】，则把文本清空，然后把新的节点里的子节点创建一份然后插入到旧的节点里面。

      * ② 该节点不包含子节点
        如果该节点不包含子节点，同时它又不是文本节点，那就说明该节点是个空节点，那就好办了，不管旧节点之前里面都有啥，直接清空即可。
*/

// 更新节点
function patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly) {
  // vnode与oldVnode是否完全一样？若是，退出程序
  if (oldVnode === vnode) {
    return;
  }
  const elm = (vnode.elm = oldVnode.elm);
  // vnode与oldVnode是否都是静态节点？若是，退出程序
  if (
    isTrue(vnode.isStatic) &&
    isTrue(oldVnode.isStatic) &&
    vnode.key === oldVnode.key &&
    (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
  ) {
    return;
  }
  const oldCh = oldVnode.children;
  const ch = vnode.children;
  // vnode有text属性？若没有：
  if (isUndef(vnode.text)) {
    // vnode的子节点与oldVnode的子节点是否都存在？
    if (isDef(oldCh) && isDef(ch)) {
      // 若都存在，判断子节点是否相同，不同则更新子节点
      if (oldCh !== ch)
        updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
    } else if (isDef(ch)) {
      // 若只有vnode的子节点存在
      /**
       * 判断oldVnode是否有文本？
       * 若没有，则把vnode的子节点添加到真实DOM中
       * 若有，则清空Dom中的文本，再把vnode的子节点添加到真实DOM中
       */
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, "");
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
    } else if (isDef(oldCh)) {
      // 若只有oldnode的子节点存在
      // 清空DOM中的子节点
      removeVnodes(elm, oldCh, 0, oldCh.length - 1);
    } else if (isDef(oldVnode.text)) {
      // 若vnode和oldnode都没有子节点，但是oldnode中有文本
      nodeOps.setTextContent(elm, "");
    }
  } else if (oldVnode.text !== vnode.text) {
    // 若有，vnode的text属性与oldVnode的text属性是否相同？
    // 若不相同：则用vnode的text替换真实DOM的文本
    nodeOps.setTextContent(elm, vnode.text);
  }
}
