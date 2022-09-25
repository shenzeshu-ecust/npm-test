// 可索引类型具有一个 索引签名，它描述了对象索引的类型，还有相应的索引返回值类型。 
interface StringArray {
    [index: number]: string;
}

let myArray: StringArray;
myArray = ["Bob", "Fred"];

let myStr: string = myArray[0]; // 通过索引获取

/*
 * TypeScript支持两种索引签名：字符串和数字。 
~ 可以同时使用两种类型的索引，但是 数字索引 的返回值  必须是  字符串索 引返回值类型的 子类型。 
~ 这是因为当使用 number来索引时，JavaScript会将它转换成string然后再去索引对象。
 也就是说用 100（一个number）去索引等同于使用"100"（一个string）去索引，因此两者需要保持一致。
 */
 class Animal {
    name: string;
}
class Dog extends Animal {
    breed: string;
}

// 错误❎：使用数值型的字符串索引，有时会得到完全不同的Animal!
interface NotOkay {
    [x: number]: Animal;
    [x: string]: Dog;
}
// 正确✅
interface Okay {
    [x: number]: Dog
    [x: string]: Animal
}

// ~ 字符串索引签名 能够很好的描述dictionary模式，并且它们也会 确保所有属性与其返回值类型相匹配。 
// 因为字符串索引声明了 obj.property和obj["property"]两种形式都可以。 
// 下面的例子里， name的类型与字符串索引类型不匹配，所以类型检查器给出一个错误提示：
interface NumberDictionary {
    [index: string]: number;
    length: number;    // 可以，length是number类型
    name: string       // 错误，`name`的类型与索引类型返回值的类型不匹配
  }
// ! 你可以将索引签名设置为只读，这样就防止了给索引赋值：
interface ReadonlyStringArray {
    readonly [index: number]: string;
}
let myArray1: ReadonlyStringArray = ["Alice", "Bob"];
myArray1[2] = "Mallory"; // error!