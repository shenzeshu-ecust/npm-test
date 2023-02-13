let obj = {
  name: "szs",
};
Object.defineProperty(obj, "name", {
  configurable: false,
});
// ! 1 请注意：configurable: false 防止更改和删除属性标志，但是允许更改对象的值。
obj.name = "111";
console.log(obj.name); // 111 可以改写
// ! 2 对于不可配置的属性，唯一可行的特性更改：writable true → false
// 我们可以将 writable: true 更改为 false，从而防止其值被修改（以添加另一层保护）。但无法反向行之。
Object.defineProperty(obj, "name", {
  writable: false,
});
obj.name = "222";
console.log(obj.name); // ~ 改写无效：说明上述对name的配置生效了
