// async返回的是Promise对象
// await可以取到promise对象中的值
async function getName() {
    let name = 'shenzehsu'
    return name

}
console.log(getName()); //Promise { 'shenzehsu' }
// await 获取promise中的值
async function getName2() {

    let res = await getName()
    console.log(res);
}
getName2()