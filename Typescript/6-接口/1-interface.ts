/**接口是一系列抽象方法的声明，是一些方法特征的集合，这些方法都应该是抽象的，需要由具体的类去实现，然后第三方就可以通过这组抽象方法调用，让具体的类执行具体的方法。 */
interface IPerson {
    firstName:string,
    lastName:string,
    sayHi:()=>string
}
var customer:IPerson = {
    firstName:'Tom',
    lastName:'Hanks',
    sayHi:():string=>{
        return 'Hi'
    }
}
interface RunOptions { 
    program:string; 
    commandline:string[] | string | (()=>string); 
} 
 
// commandline 是字符串
var options:RunOptions = {program:"test1",commandline:"Hello"}; 
console.log(options.commandline)  
 
// commandline 是字符串数组
options = {program:"test1",commandline:["Hello","World"]}; 
console.log(options.commandline[0]); 
console.log(options.commandline[1]);  
 
// commandline 是一个函数表达式
options = {program:"test1",commandline:()=>{return "**Hello World**";}}; 
 
var fn:any = options.commandline; 
console.log(fn());