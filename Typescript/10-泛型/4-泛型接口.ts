interface GenericIdentityFn {
    <T>(arg: T): T
}
function identity3<T>(arg: T): T {
    return arg
}
let myIdentity3: GenericIdentityFn = identity3
// ~ 我们可能想把泛型参数当作整个接口的一个参数。 这样我们就能清楚的知道使用的具体是哪个泛型类型
// ~（比如： Dictionary<string>而不只是Dictionary）。 这样接口里的其它成员也能知道这个参数的类型了。 
interface GenericIdentityFn1<T> { // ! 加上<T> 把非泛型函数签名作为泛型类型一部分
    (arg: T): T; // ! 没有<T>  不再描述泛型函数
}

function identity4<T>(arg: T): T {
    return arg;
}
let myIdentity4: GenericIdentityFn1<number> = identity4
// 把非泛型函数签名作为泛型类型一部分。 当我们使用 GenericIdentityFn的时候，还得传入一个类型参数来指定泛型类型（这里是：number），锁定了之后代码里使用的类型。