const name = {
    surname: 'shen',
    getSurName() {
        console.log('姓氏： ', this.surname);
    }
}
const age = {
        age: 25
    }
    // 暴露模块
    // 1 
    // module.exports = { name, age }
    // 2 exports 相当于 module.exports
exports.name = name
exports.age = age