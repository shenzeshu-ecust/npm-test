// 我们先检查用户密码是否正确，然后再允许其修改员工信息
let password = 'secret password'
class Emp {
    private _fullName: string;
    get fullName(): string {
        return this._fullName
    }
    set fullName(newName: string) {
        if(password && password === 'secret password') {
            this._fullName = newName
        } else {
            console.log('Error!');
            
        }
    }
}
let emp = new Emp()
emp.fullName = 'szs'
console.log(emp.fullName);
// ! 只带有 get不带有 set的存取器自动被推断为 readonly