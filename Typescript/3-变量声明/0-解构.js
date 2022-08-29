let [first] = [1,2,3]
console.log(first); // 1
let [, sec, , fourth] = [1,2,3,4]
console.log(sec); // 2
let [one, ...rest] = [1, 2, 3]
console.log(one); // 1
console.log(rest); // [2, 3]