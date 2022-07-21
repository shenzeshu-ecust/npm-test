let arr = [1,2,3,4]
arr.forEach(v=> {
    if(v==3) {
        return // 不执行这个循环的下面的语句了  但是循环继续
    }
    console.log(v);
})