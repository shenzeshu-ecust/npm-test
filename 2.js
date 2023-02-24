console.log("\u0009");
console.log("\uDF77");

function wrap(target) {
  return new Proxy(target, {
    get(target, prop) {
      let value = Reflect.get(...arguments);
      if (!value) throw new Error("不存在该属性");
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
let pp = {
  name: "John",
};
pp = wrap(pp);
console.log(pp.name);
console.log(pp.age);
