// ! 单例类型 : 多数是指枚举成员类型enum和 数字/字符串字面量类型
/*
    可以合并单例类型，联合类型，类型保护和类型别名来创建一个叫做 可辨识联合的高级模式，它也称做 标签联合或 代数数据类型。 
    可辨识联合在函数式编程很有用处。 一些语言会自动地为你辨识联合；而TypeScript则基于已有的JavaScript模式。 它具有3个要素：

    1 具有普通的单例类型属性 — 可辨识的特征。
    2一个类型别名包含了那些类型的联合— 联合。
    3 此属性上的类型保护。

*/
interface Square {
    kind: "square"; // ~ kind属性称做 可辨识的特征或 标签。
    size: number;
}
interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}
interface Circle {
    kind: "circle";
    radius: number;
}
type Shape = Square | Rectangle | Circle ;
// ~ 现在我们使用可辨识联合:
function area(s: Shape) {
    switch (s.kind) {
        case "square": return s.size * s.size;
        case "rectangle": return s.height * s.width;
        case "circle": return Math.PI * s.radius ** 2;
    }
}

