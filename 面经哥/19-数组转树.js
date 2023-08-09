const arr = [
  { id: 2, parent_id: 0, name: "上海市" },
  { id: 1, parent_id: 0, name: "北京市" },
  { id: 3, parent_id: 0, name: "广东省" },
  { id: 21, parent_id: 2, name: "静安区" },
  { id: 22, parent_id: 2, name: "黄浦区" },
  { id: 24, parent_id: 2, name: "徐汇区" },
  { id: 12, parent_id: 1, name: "朝阳区" },
  { id: 13, parent_id: 1, name: "昌平区" },
  { id: 11, parent_id: 1, name: "顺义区" },
  { id: 31, parent_id: 3, name: "广州市" },
  { id: 32, parent_id: 3, name: "深圳市" },
  { id: 33, parent_id: 3, name: "东莞市" },
  { id: 241, parent_id: 24, name: "田林街道" },
  { id: 242, parent_id: 24, name: "漕河泾街道" },
  { id: 2421, parent_id: 242, name: "上海科技绿洲" },
  { id: 2422, parent_id: 242, name: "漕河泾开发区" },
];

/*
 * 数组转树的过程总共分为几步：

    将数组转成map结构，这一步主要是方便后面子寻父的操作
    再次循环数组
    子元素归类到父元素中
    推出父元素到新数组
 */
function arr2Tree(list) {
  let obj = {};
  let res = [];
  for (let item of list) {
    obj[item.id] = item;
  }
  for (let item of list) {
    if (obj[item.parent_id]) {
      // 有父元素，作为他的子元素
      (
        obj[item.parent_id].children || (obj[item.parent_id].children = [])
      ).push(item);
    } else {
      // 没有父元素，自己就为父元素
      res.push(item);
    }
  }
  return res;
}
console.log(arr2Tree(arr));

let list1 = [
  {
    id: 2,
    parent_id: 0,
    name: "上海市",
    children: [
      { id: 21, parent_id: 2, name: "静安区" },
      { id: 22, parent_id: 2, name: "黄浦区" },
      {
        id: 24,
        parent_id: 2,
        name: "徐汇区",
        children: [
          { id: 241, parent_id: 24, name: "田林街道" },
          {
            id: 242,
            parent_id: 24,
            name: "漕河泾街道",
            children: [
              { id: 2421, parent_id: 242, name: "上海科技绿洲" },
              { id: 2422, parent_id: 242, name: "漕河泾开发区" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 1,
    parent_id: 0,
    name: "北京市",
    children: [
      { id: 12, parent_id: 1, name: "朝阳区" },
      { id: 13, parent_id: 1, name: "昌平区" },
      { id: 11, parent_id: 1, name: "顺义区" },
    ],
  },
  {
    id: 3,
    parent_id: 0,
    name: "广东省",
    children: [
      { id: 31, parent_id: 3, name: "广州市" },
      { id: 32, parent_id: 3, name: "深圳市" },
      { id: 33, parent_id: 3, name: "东莞市" },
    ],
  },
];
/*

循环树 最开始取的是父数据，判断时候存在子数据，有子数据concat到要循环的树后面
删除父数据中的children，将数据传入到新数组中
继续循环树，循环完父节点，后续子节点都会跳过children的判断，并且全部push到新数组中
 */
function TreeToArr(list) {
  let arr = [];
  let a = [].concat(list);
  while (a.length > 0) {
    let first = a.shift();
    if (first.children) {
      a = a.concat(first.children);
      delete first.children;
    }
    arr.push(first);
  }
  return arr;
}

console.log(TreeToArr(list1));

function arr2Tree(list) {
  let map = {};
  let res = [];
  for (let item of list) {
    map[item.id] = item;
  }
  for (let item of list) {
    if (map[item.parent_id]) {
      (
        map[item.parent_id].children || (map[item.parent_id].children = [])
      ).push(item);
    } else {
      res.push(item);
    }
  }
  return res;
}

function TreeToArray(list) {
  let res = [];
  let temp = [].concat(list); // ~ 注意concat有返回值！必须要赋值给temp
  while (temp.length) {
    const target = temp.shift();
    if (target.children) {
      temp = temp.concat(target.children);
      delete target.children;
    }
    res.push(target);
  }
  return res;
}
