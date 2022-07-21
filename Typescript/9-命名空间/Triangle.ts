/// <reference path = "IShape.ts" /> 
namespace Drawing { 
    export class Triangle implements IShape { 
        public draw() { 
            console.log("Triangle is drawn"); 
        } 
    } 
}
// 如果一个命名空间在一个单独的 TypeScript 文件中，则应使用三斜杠 /// 引用它