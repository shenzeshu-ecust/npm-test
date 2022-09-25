/*
TypeScript 中，可以使用访问控制符来保护对类、变量、方法和构造方法的访问。TypeScript 支持 3 种不同的访问权限。

    public（默认） : 公有，可以在任何地方被访问。

    protected : 受保护，可以被其自身以及其子类和父类访问。

    private : 私有，只能被其定义所在的类访问。当成员被标记成 private时，它就不能在声明它的类的外部访问。比如：
*/
// ! private
class Encapsulate {
  str1: string = "hello"; // public
  private str2: string = "world";
}

var objnew = new Encapsulate();
console.log(objnew.str1); // 可访问
//  console.log(objnew.str2)   // 编译错误， str2 是私有的

// ! 2 protected
// protected修饰符与 private修饰符的行为很相似，但有一点不同， protected成员在派生类中仍然可以访问。例如：
class Person {
  protected name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Employee extends Person {
  private department: string;

  constructor(name: string, department: string) {
    super(name);
    this.department = department;
  }

  public getElevatorPitch() {
    return `Hello, my name is ${this.name} and I work in ${this.department}.`;
  }
}

let howard = new Employee("Howard", "Sales");
console.log(howard.getElevatorPitch());
console.log(howard.name); // 错误

// ~ 构造函数也可以被标记成 protected。 这意味着这个类不能在包含它的类外被实例化，但是能被继承。比如，
class Person1 {
  protected name: string;
  protected constructor(theName: string) {
    this.name = theName;
  }
}

// Employee 能够继承 Person
class Employee1 extends Person1 {
  private department: string;

  constructor(name: string, department: string) {
    super(name);
    this.department = department;
  }

  public getElevatorPitch() {
    return `Hello, my name is ${this.name} and I work in ${this.department}.`;
  }
}

let howard1 = new Employee1("Howard", "Sales");
let john = new Person1("John"); // 错误: 'Person' 的构造函数是被保护的.

// ! readonly 将属性设置为只读的。 只读属性必须在声明时或构造函数里被初始化
class Octopus {
  readonly name: string;
  readonly numberOfLegs: number = 8; // ~ 只读属性必须在声明时或构造函数里被初始化
  constructor(theName: string) {
    this.name = theName; // ~ 只读属性必须在声明时或构造函数里被初始化
  }
}
let dad = new Octopus("Man with the 8 strong legs");
dad.name = "jksafbejswkfkjs"; // *  错误! name 是只读的.
