// 假如我们在 JavaScript 定义了一个对象：
// var sites = { 
//    site1:"Runoob", 
//    site2:"Google" 
// };

// 这时如果我们想在对象中添加方法，可以做以下修改：

// sites.sayHello = function(){ return "hello";}

// 如果在 TypeScript 中使用以上方式则会出现编译错误，因为Typescript 中的对象必须是特定类型的实例。
var sites = {
    site1: "Runoob",
    site2: "Google",
    sayHello: function () { } // 类型模板
};
sites.sayHello = function () {
    console.log("hello " + sites.site1);
};
sites.sayHello();