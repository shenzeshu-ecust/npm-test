// 重载是方法名字相同，而参数不同，返回类型可以相同也可以不同。

// 每个重载的方法（或者构造函数）都必须有一个独一无二的参数类型列表。

// 参数类型不同：

// function disp(string):void; 
// function disp(number):void;

// 参数数量不同：

// function disp(n1:number):void; 
// function disp(x:number,y:number):void;

// 参数类型顺序不同：

// function disp(n1:number,s1:string):void; 
// function disp(s:string,n:number):void;

// 如果参数类型不同，则参数类型应设置为 any。

// 参数数量不同你可以将不同的参数设置为可选。