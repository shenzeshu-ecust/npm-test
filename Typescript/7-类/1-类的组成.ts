class Car { 
    // 字段
    engine:string; 
    
    // 构造函数
    constructor(engine:string) { 
       this.engine = engine 
    }  
    
    // 方法
    disp():void { 
       console.log("函数中显示发动机型号  :   "+this.engine) 
    } 
 } 
  
 // 创建一个对象
 var car = new Car("XXSY1")
  
 // 访问字段
 console.log("读取发动机型号 :  "+car.engine)  
  
 // 访问方法
 car.disp()