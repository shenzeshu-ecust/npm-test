// static 关键字用于定义类的数据成员（属性和方法）为静态的，静态成员可以直接通过类名调用。
class StaticMem {  
    static num:number; 
    
    static disp():void { 
       console.log("num 值为 "+ StaticMem.num) 
    } 
 } 
  
 StaticMem.num = 12     // 初始化静态变量
 StaticMem.disp()       // 调用静态方法