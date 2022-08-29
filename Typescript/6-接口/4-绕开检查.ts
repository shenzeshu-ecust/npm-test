interface SquareConfig {
    color?: string;
    width?: number;
}

function createSquare(config: SquareConfig): any {
    // ...
}

let mySquare = createSquare({ opacity: 0.5, width: 100 }); // opacity属性不存在会报错
// ~ 解决办法
// 1 类型断言
let mySquare1 = createSquare({width: 100, opacity: 0.6} as SquareConfig)
// 2 最佳的方式是能够添加一个字符串索引签名，前提是你能够确定这个对象可能具有某些做为特殊用途使用的额外属性。
interface SquareConfig1 {
    color?: string;
    width?: number;
    [propName: string]: any;
}
// 3 惊讶的跳过检查方式 将这个对象赋值给一个另一个变量： 因为 squareOptions不会经过额外属性检查，所以编译器不会报错。
let squareOptions = { bgcolour: "red", width: 100 };
let mySquare2 = createSquare(squareOptions);



