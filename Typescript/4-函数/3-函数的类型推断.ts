// 如果你在赋值语句的一边指定了类型但是另一边没有类型的话，TypeScript编译器会自动识别出类型：
let myadd: (baseValue: number, increment: number) => number = function(x, y) {
    return x + y
}
// 这叫做“按上下文归类”，是类型推论的一种

// 理论上完整的声明赋值方式：
/*
    * 只要参数类型是匹配的，那么就认为它是有效的函数类型，而不在乎参数名是否正确。
    let myAdd: (baseValue: number, increment: number) => number = function(x: number, y: number): number { 
        return x + y 
    }
 */ 