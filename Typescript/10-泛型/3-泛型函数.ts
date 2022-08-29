// 定义泛型函数
function identity<T>(arg: T): T {
    return arg;
}

let myIdentity: <T>(arg: T) => T = identity;

// 我们还可以使用带有调用签名的对象字面量来定义泛型函数：
function identity<T>(arg: T): T {
    return arg;
}

let myIdentity1: {<T>(arg: T): T} = identity;
