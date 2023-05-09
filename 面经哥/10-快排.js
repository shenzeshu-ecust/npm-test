function quickSort(arr, left, right) {
  if (left >= right) return;
  let i = left;
  let j = right;
  let pivot = left;
  while (i < j) {
    while (i < j && arr[j] >= arr[pivot]) j--;
    while (i < j && arr[i] <= arr[pivot]) i++;
    if (i < j) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i], arr[pivot]] = [arr[pivot], arr[i]];
  quickSort(arr, left, i - 1);
  quickSort(arr, i + 1, right);
}

let arr = [9, 6, 7, 4, 3, 2, 0];

quickSort(arr, 0, arr.length - 1);
console.log(arr);

function quickSort(arr, left, right) {
  if (left >= right) return;
  let i = left;
  let j = right;
  let pivot = left;
  while (i < j) {
    while (i < j && arr[j] >= arr[pivot]) j--;
    while (i < j && arr[i] <= arr[pivot]) i++;
    if (i < j) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[pivot], arr[i]] = [arr[i], arr[pivot]];
  quickSort(arr, left, i - 1);
  quickSort(arr, i + 1, right);
}
