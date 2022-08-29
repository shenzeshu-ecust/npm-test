// 参数列表里的每个参数都需要名字和类型。 
interface SearchFunc {
    (source: string, subString: string): boolean
}
let mySearch: SearchFunc;
mySearch = function (source: string, subString: string) {
    let result = source.search(subString);
    return result > -1;
}
// ! 对于函数类型的类型检查来说，函数的参数名不需要与接口里定义的名字相匹配
let mySearch1: SearchFunc;
mySearch1 = function(src: string, sub: string): boolean {
  let result = src.search(sub);
  return result > -1;
}
// ! 函数参数会自动检查，不想指定类型也可以
let mySearch2: SearchFunc
mySearch2 = function(a, b) {
    let res = a.search(b)
    return res > -1
}
