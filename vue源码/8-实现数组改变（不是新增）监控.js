// vue 中没法检测数组变化 这不是 Object.defineProperty 的原因  而是性能考虑
// 新增索引确实做不到
// 实现 
let arr1 = [1,2,3]

let defineReactive = (data, key, value) => {
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get() {
      console.log(`get key ${key}, val ${value}`)
      return value
    },
    set(v) {
      console.log(`set key ${key} to val ${v}`)
      value = v
    }
  })

}

function observe(arr) {
  Object.keys(arr).forEach(key => {
    defineReactive(arr, key, arr[key])
  })
}

observe(arr1)

arr1[0] = 4
console.log(JSON.stringify(arr1, null, 2))