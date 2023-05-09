function myInstanceof(left, right) {
  let leftProto = left.__proto__;
  let rightProto = right.prototype;
  if (!leftProto) return false;
  else if (leftProto === rightProto) return true;
  return myInstanceof(leftProto, right);
}

class A {
  constructor(name) {
    this.name = name;
  }
}

class B extends A {
  constructor(name) {
    super(name);
  }
}

let b = new B();
console.log(myInstanceof(b, A));
