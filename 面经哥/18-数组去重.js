let arr = [1, 1, 2, 2, 3, 4, 5, 0, 9, 1];
// 1 new Set
console.log(Array.from(new Set(arr)));
console.log([...new Set(arr)]);

// 2 filter
console.log(arr.filter((val, i, arr) => arr.indexOf(val) === i));

// 3 hashMap
function unique(arr) {
  let map = new Set();
  let res = [];
  for (const v of arr) {
    if (!map.has(v)) {
      map.add(v);
      res.push(v);
    }
  }
  return res;
}
console.log(unique(arr));

// 4 reduce
function reduceRepeat(arr) {
  return arr.reduce((acc, val) => {
    !acc.includes(val) && acc.push(val);
    return acc;
  }, []);
}
console.log(reduceRepeat(arr));

// 5 排序
function repeatSort(arr) {
  let sortedArr = arr.sort((a, b) => a - b);
  let res = [sortedArr[0]];
  for (let i = 0; i < sortedArr.length - 1; i++) {
    if (sortedArr[i] !== sortedArr[i + 1]) {
      res.push(sortedArr[i + 1]);
    }
  }
  return res;
}

console.log("排序后的", repeatSort(arr));
