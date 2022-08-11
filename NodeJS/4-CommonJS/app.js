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
    module.exports = { name, age }
    // 2 exports 相当于 module.exports
// exports.name = name
// exports.age = age
/**
 *  exports和module.exports其实是一个东西，不信我们来输出一下

    console.log(module.exports === exports);  true

    先说说它们之间的区别：

    exports只能使用语法来向外暴露内部变量：如http://exports.xxx = xxx;
    module.exports既可以通过语法，也可以直接赋值一个对象。

 */