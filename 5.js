function quickSort(arr, left, right) {
    if(left >= right) return
    // let ran = Math.floor(Math.random() * (right - left + 1)) + left
    // let t = arr[ran]
    // arr[ran] = arr[left]
    // arr[left] = t

    let pivot = Math.floor((left + right) / 2)
    let i = left
    let j = right
    while(i < j) {
      while(i < j && arr[j] >= arr[pivot]) j--;
      while(i < j && arr[i] <= arr[pivot]) i++
      if(i < j) {
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
    }
    [arr[pivot], arr[i]] = [arr[i], arr[pivot]]
    quickSort(arr, left, i - 1)
    quickSort(arr, i + 1, right)
  }
  let t1 = performance.now()
  let arr = [9,8,7,6,5,4,3,2,1,0]
  // quickSort(arr, 0 , arr.length - 1)
  // console.log(arr, performance.now() - t1)

// const tag = (strings, ...values) => ({strings, values})
// const f = (x) => tag`hello ${x} how are you`

// console.log(f('world'))
// console.log(f(3))

// console.log(f('world').strings === f(1 + 2).strings)



let person = {
  _name: 'szs',
  get name() {
    return this._name
  }
}


let p = new Proxy(person, {
  get(target, property, receiver) {
    return target[property]
    // return Reflect.get(...arguments)
  }
})

let person2 = {
  __proto__: p,
  _name: 'sss'
}



console.log(person2.name)







let toA = [
  {name: 'szs', age: 28}, 
  {name: 'dlf', age: 29}
]
// console.log(toA.slice())


 function changeKey(list, fromKey, toKey) {
  if (!list || list.length === 0) return [];
  const nextList = [...list]
  return nextList.map((v) => {
    v[toKey] = v[fromKey];
    delete v[fromKey];
    return v;
  });
}

 const toB = changeKey(toA, 'age', 'money')
console.log(toA, toB)

let ss1 = [{name: 1},2]
let ss2 = ss1.slice()
ss2[0].name = 2
console.log(ss1, ss2)
