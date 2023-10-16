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
  quickSort(arr, 0 , arr.length - 1)
  console.log(arr, performance.now() - t1)

  let s = 'https://account-center.boomingtech.com/api/v1/user/username/?token=a-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQzLCJ1c2VybmFtZSI6InRlc3QiLCJ0b2tlbnR5cGUiOiJhY2Nlc3MiLCJjcmVhdGVfdGltZSI6MTY5Mzg4NDEzMiwiYXVkIjoiYm9vbWluZ19hY2NvdW50X2NlbnRlcl91c2VyIiwiZXhwIjoxNjkzOTcwNTMyLCJqdGkiOiI0MyIsImlhdCI6MTY5Mzg4NDEzMiwiaXNzIjoiYm9vbWluZ19hY2NvdW50X2NlbnRlciJ9.13o49FV12nUnmsghZlhrNaW96Gv66CxA6zw2O7C2pro'

  const regex = /token=([^\&]+)/;
  const matches = s.match(regex)
  if (matches && matches.length > 1) {
    const token = matches[1];
    console.log(token);
  } else {
    console.log("未找到 token 值");
  }

