/*
命名空间一个最明确的目的就是解决重名问题。
命名空间定义了标识符的可见范围，一个标识符可在多个名字空间中定义，它在不同名字空间中的含义是互不相干的。
*/
// TypeScript 中命名空间使用 namespace 来定义，语法格式如下：
namespace SomeNameSpaceName { 
   export interface ISomeInterfaceName {      }  
   export class SomeClassName {      }  
}

// 以上定义了一个命名空间 SomeNameSpaceName，如果我们需要在外部可以调用 SomeNameSpaceName 中的类和接口，则需要在类和接口添加 export 关键字。

// 要在另外一个命名空间调用语法格式为：
SomeNameSpaceName.SomeClassName;

