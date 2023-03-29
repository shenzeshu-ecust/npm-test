// ! 1 patch
// 在Vue中，把 DOM-Diff过程叫做patch过程。patch,意为“补丁”，即指对旧的VNode修补，打补丁从而得到新的VNode
/*
整个patch无非就是干三件事：

    创建节点：新的VNode中有而旧的oldVNode中没有，就在旧的oldVNode中创建。
    删除节点：新的VNode中没有而旧的oldVNode中有，就从旧的oldVNode中删除。
    更新节点：新的VNode和旧的oldVNode中都有，就以新的VNode为准，更新旧的oldVNode。
*/
