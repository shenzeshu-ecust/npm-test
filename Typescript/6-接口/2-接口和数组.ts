// 接口中我们可以将数组的索引值和元素设置为不同类型，索引值可以是数字或字符串。
interface ages { 
    [index:string]:number 
 } 
  
 var agelist:ages; 
 agelist["John"] = 15   // 正确 只能使用字符串来访问
//  agelist[2] = "nine"   // 错误