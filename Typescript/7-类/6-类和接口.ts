// 类可以实现接口，使用关键字 implements
interface ILoan { 
    interest:number 
 } 
//  实现类
 class AgriLoan implements ILoan { 
    interest:number 
    rebate:number 
    
    constructor(interest:number,rebate:number) { 
       this.interest = interest 
       this.rebate = rebate 
    } 
 } 