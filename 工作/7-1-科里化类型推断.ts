type Curried<A, R> = A extends []
  ? () => R
  : A extends [infer ARG]
  ? (param: ARG) => R
  : A extends [infer ARG, ...infer REST]
  ? (param: ARG) => Curried<REST, R>
  : never;

declare function curry<A extends any[], R>(
  fn: (...args: A) => R
): Curried<A, R>;

// function curry() {
//   return function curried(...args1) {
//     if (args1.length >= fn.length) return fn.apply(this, args1);
//     else
//       return function (...args2) {
//         return curried.apply(this, args1.concat(args2));
//       };
//   };
// }
function sum(a: number, b: string, c: object) {
  return 1243;
}
const currySum = curry(sum);

currySum(1)("ss")({});
