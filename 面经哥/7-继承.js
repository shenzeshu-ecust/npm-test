// 1 寄生组合式继承
function inheritPrototype(subType, superType) {
  const protoType = Object.create(superType.prototype);
  protoType.constructor = subType;
  subType.prototype = protoType;
}

function Animal(name) {
  this.name = name;
  this.colors = ["red", "blue"];
}

function Cat(name, age) {
  Animal.call(this, name);
  this.age = age;
}

inheritPrototype(Cat, Animal);

// 2 原型链继承
Cat.prototype = new Animal();
Cat.prototype.constructor = Cat;

// 3 构造函数继承
function Cat(name, age) {
  Animal.call(this, name);
}

// 4 组合式继承
// 也就是 原型链继承 + 构造函数继承
