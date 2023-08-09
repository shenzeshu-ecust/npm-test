// 1 extends  与三目运算符一起使用的时候用于条件判断，其他时候就是继承类

// type NonNullable<T> = T extends null | undefined ? never : T
// ~ 当extends左边的类型可分配给右边的类型时，那么你将在第一个分支(“true”分支)中获得该类型;否则，您将在后面的分支(“false”分支)中获得类型。

type Human = {
  name: string;
  age: number;
};
type lookasHuman = {
  name: string;
};
type Bool = lookasHuman extends Human ? "yes" : "no"; // Bool => 'no'
// ~ 上面lookasHuman 中没有age属性 不满足Human 的约束条件

// * 下面这个可以，因为lookasHuman1有Human1的所有属性，满足约束
type Human1 = {
  name: string;
};
type lookasHuman1 = {
  name: string;
  age: number;
};
type Bool1 = lookasHuman1 extends Human1 ? "yes" : "no"; // Bool => 'yes'

type A1 = "x" extends "x" ? string : number; // string
type A2 = "x" | "y" extends "x" ? string : number; // number
type A3 = "y" | "x" extends "x" ? string : number; // number
type A4 = "y" extends "x" | "y" ? string : number; // string
type A5 = "y" | "x" extends "x" | "y" ? string : number; // string

type P<T> = T extends "x" ? string : number;
type B = P<"x" | "y">; // string | number

// * 对于type B：
/*
对于使用extends关键字的条件类型（即上面的三元表达式类型），
    ~ 如果extends前面的参数是一个泛型类型，
    ~ 当传入该参数的是联合类型，
    则使用 分配律计算最终的结果。

分配律是指: 
    ~ 将联合类型的联合项拆成单项，分别代入条件类型，
    ~ 然后将每个单项代入得到的结果再联合起来，得到最终的判断结果。

type ToArray<Type> = Type extends string ? string : number;
 
type StrArrOrNumArr = ToArray<string | number>;


即ToArray<string | number> = ToArray | ToArray
分别带入：
ToArray : string extends string ? string : number; // string
ToArray: number extends string ? string : number; // number
然后在将每一项得到的结果联合起来，得到string|number

*/

// ! 遇到never
// never是所有类型的子类型
type A = never extends "x" ? string : number; // string

type PP<T> = T extends "x" ? string : number;
type BB = PP<never>; // never
/*
实际上，这里还是条件分配类型在起作用。
~ never被认为是空的联合类型，也就是说，没有联合项的联合类型，
~ 所以还是满足上面的分配律，然而因为没有联合项可以分配，
~ 所以P<T>的表达式其实根本就没有执行，所以B的定义也就类似于永远没有返回的函数一样，是never类型的。


*/
let a: BB;
a = 1;
