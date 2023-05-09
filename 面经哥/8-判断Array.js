let arr = [1, 2, 3];
console.log(Array.isArray(arr));

console.log(Object.prototype.toString.call(arr)); // [object Array]

console.log(arr instanceof Array);

console.log(Object.getPrototypeOf(arr) === Array.prototype);
console.log(arr.__proto__ === Array.prototype);

console.log(arr.constructor === Array);

console.log(Array.prototype.isPrototypeOf(arr));
