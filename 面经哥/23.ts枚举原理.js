let Day;
(function (Day) {
  Day[(Day["Monday"] = 0)] = "Monday";
  Day[(Day["Tuesday"] = 1)] = "Tuesday";
  Day[(Day["Wednesday"] = 2)] = "Wednesday";
})(Day || (Day = {}));
let day = Day.Monday;
let d = Day[0];
console.log(day, d);
/**
 * TypeScript 中定义的枚举，编译之后其实是一个对象，生成的代码中，枚举类型被编译成一个对象，
 * 它包含了正向映射（ name -> value）和反向映射（ value -> name）
 * TypeScript 会把定义的枚举值的字段名分别作为对象的属性名和属性值，
 * 把枚举值的字段值分别作为对象的属性值和属性名，同时添加到对象中。
 * 这样既可以通过枚举值的字段名得到值，也可以通过枚举值的值得到字段名。
 */
