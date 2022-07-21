/**接口继承就是说接口可以通过其他接口来扩展自己。

Typescript 允许接口继承多个接口。

继承使用关键字 extends。 */
// 1 单继承
interface Person {
    age:number
}
// 继承
interface Musician extends Person{
    instrument:string
}
var drummer = <Musician>{}
drummer.age = 26
drummer.instrument = 'Drums'
// 2 多继承
interface IParent1 {
    v1:number
}
interface IParent2 { 
    v2:number 
} 
interface Child extends IParent1,IParent2 {}

// var haha:Child = {v1:12,v2:13}