interface LabelledValue {
    label: string;
}

function printLabel(labelledObj: LabelledValue) {
    console.log(labelledObj.label);
}

let myObj = { size: 10, label: "Size 10 Object" };
printLabel(myObj);
// ! 可选属性 ？
interface SquareConfig {
    color?: string;
    width?: number;
}
// ! 只读属性
// * 一些对象属性只能在对象刚刚创建的时候修改其值。 你可以在属性名前用 readonly来指定只读属性:
interface Point {
    readonly x: number;
    readonly y: number;
}
// 你可以通过赋值一个对象字面量来构造一个Point。 赋值后， x和y再也不能被改变了。

let p1: Point = { x: 10, y: 20 };
p1.x = 5; // error!

