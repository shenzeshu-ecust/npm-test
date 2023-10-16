function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);
  const a = mergeSort(left);
  const b = mergeSort(right);
  return merge(a, b);
}

function merge(a, b) {
  let res = [];
  while (a.length && b.length) {
    if (a[0] <= b[0]) {
      res.push(a.shift());
    } else {
      res.push(b.shift());
    }
  }
  a.length > 0 ? (res = res.concat(a)) : (res = res.concat(b));
  //   while (a.length) res.push(a.shift());
  //   while (b.length) res.push(b.shift());
  return res;
}
const arr = [3, 44, 38, 5, 47, 15, 36, 26, 27, 2, 46, 4, 19, 50, 48];
console.log(mergeSort(arr));
