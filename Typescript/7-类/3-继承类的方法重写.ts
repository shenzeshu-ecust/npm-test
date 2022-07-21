// 类继承后，子类可以对父类的方法重新定义，这个过程称之为方法的重写。

// 其中 super 关键字是对父类的直接引用，该关键字可以引用父类的属性和方法。
class PrinterClass {
    doPrint():void {
        console.log("父类");
        
    }
}
class StringPrinter extends PrinterClass {
    doPrint():void {
        super.doPrint() // 调用父类的方法
        console.log("子类");
        
    }
}