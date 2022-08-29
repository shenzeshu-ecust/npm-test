// ! 1 可选参数
function buildName(firstName, lastName) {
    if (lastName)
        return firstName + ' ' + lastName;
    return firstName;
}
// ! 2 剩余参数
function buildName2(firstName) {
    var restOfName = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        restOfName[_i - 1] = arguments[_i];
    }
    return firstName + " " + restOfName.join(" ");
}
var employeeName = buildName2("Joseph", "Samuel", "Lucas", "MacKinzie");
// ~ 这个省略号也会在带有剩余参数的函数类型定义上使用到：
function buildName21(firstName) {
    var restOfName = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        restOfName[_i - 1] = arguments[_i];
    }
    return firstName + " " + restOfName.join(" ");
}
var buildNameFun = buildName21;
// ! 3 在TypeScript里，我们也可以为参数提供一个默认值 —— 当用户没有传递这个参数 或 传递的值是undefined时  。 它们叫做有默认初始化值的参数。
//  让我们修改上例，把last name的默认值设置为"Smith"。
function buildName3(firstName, lastName) {
    if (lastName === void 0) { lastName = "Smith"; }
    return firstName + " " + lastName;
}
var result1 = buildName("Bob"); // works correctly now, returns "Bob Smith"
var result2 = buildName("Bob", undefined); // still works, also returns "Bob Smith"
// ! 与普通可选参数不同的是，带默认值的参数不需要放在必须参数的后面。 
// ! 如果带默认值的参数出现在必须参数前面，用户必须明确的传入 undefined值来获得默认值。 
function buildName4(firstName, lastName) {
    if (firstName === void 0) { firstName = "Will"; }
    return firstName + " " + lastName;
}
var result11 = buildName("Bob"); // error, too few parameters
var result3 = buildName("Bob", "Adams"); // okay and returns "Bob Adams"
var result4 = buildName(undefined, "Adams"); // okay and returns "Will Adams"
console.log(result11);
console.log(result3);
console.log(result4);
