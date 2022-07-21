/*
TypeScript 中，可以使用访问控制符来保护对类、变量、方法和构造方法的访问。TypeScript 支持 3 种不同的访问权限。

    public（默认） : 公有，可以在任何地方被访问。

    protected : 受保护，可以被其自身以及其子类和父类访问。

    private : 私有，只能被其定义所在的类访问。
*/
class Encapsulate { 
    str1:string = "hello"  // public
    private str2:string = "world" 
 }
  
 var objnew = new Encapsulate() 
 console.log(objnew.str1)     // 可访问 
//  console.log(objnew.str2)   // 编译错误， str2 是私有的