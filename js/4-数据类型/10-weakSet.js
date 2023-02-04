/*
WeakSet 的表现类似：

  ~ 1 与 Set 类似，但是我们只能向 WeakSet 添加对象（而不能是原始值）。
    2 对象只有在其它某个（些）地方能被访问的时候，才能留在 WeakSet 中。
    3 跟 Set 一样，WeakSet 支持 add，has 和 delete 方法，但不支持 size 和 keys()，并且不可迭代。

*/

// ~ 变“弱（weak）”的同时，它也可以作为额外的存储空间。但并非针对任意数据，而是针对“是/否”的事实。WeakSet 的元素可能代表着有关该对象的某些信息。
// ~ 例如，我们可以将用户添加到 WeakSet 中，以追踪访问过我们网站的用户：
let visitedSet = new WeakSet();

let john = { name: "John" };
let pete = { name: "Pete" };
let mary = { name: "Mary" };

visitedSet.add(john); // John 访问了我们
visitedSet.add(pete); // 然后是 Pete
visitedSet.add(john); // John 再次访问

// visitedSet 现在有两个用户了

// 检查 John 是否来访过？
console.log(visitedSet.has(john)); // true

// 检查 Mary 是否来访过？
console.log(visitedSet.has(mary)); // false

john = null;

// visitedSet 将被自动清理(即自动清除其中已失效的值 john)

// ! WeakMap 和 WeakSet 最明显的局限性就是不能迭代，并且无法获取所有当前内容。那样可能会造成不便，但是并不会阻止 WeakMap/WeakSet 完成其主要工作 —— 为在其它地方存储/管理的对象数据提供“额外”存储。
// ! 它们的主要优点是它们对 对象 是 "弱引用"，所以被它们引用的对象很容易地被垃圾收集器移除。这是以不支持 clear、size、keys、values 等作为代价换来的……
