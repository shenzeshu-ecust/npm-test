// ! 1 类可以实现接口，使用关键字 implements
interface ILoan {
   interest: number
}
//  实现类
class AgriLoan implements ILoan {
   interest: number
   rebate: number

   constructor(interest: number, rebate: number) {
      this.interest = interest
      this.rebate = rebate
   }
}
// ! 2 把类当做接口使用
// 类定义会创建两个东西：类的实例类型和一个构造函数。 因为类可以创建出类型，所以你能够在允许使用接口的地方使用类。
class Point1 {
   x: number;
   y: number;
}
interface Point3D extends Point1 {
   z: number
}
let point3d: Point3D = {x : 1, y : 2, z: 3}