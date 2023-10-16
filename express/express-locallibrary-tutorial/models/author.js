const mongoose = require('mongoose');
const Schema = mongoose.Schema

const AuthorSchema = new Schema({
    first_name: {
        type: String,
        required: true,
        max: 100,
    },
    family_name: { type: String, required: true, max: 100 },
    date_of_birth: { type: Date },
    date_of_death: { type: Date },
})


// 虚拟属性'name'：表示作者全名
AuthorSchema.virtual('name').get(function() {
    return this.family_name + ', ' + this.first_name
})

// 虚拟属性'lifespan'：作者寿命
AuthorSchema.virtual('lifespan').get(function() {
    return ( this.date_of_death.getFullYear() - this.date_of_birth.getFullYear()).toString()
})

 // 虚拟属性'url'：作者 URL
 AuthorSchema.virtual('url').get(function() {
    return '/catalog/author/' + this._id
 })
// ～ mongoose.model() 方法将模式“编译”为模型。模型就可以用来查找、创建、更新和删除特定类型的对象。
// 第一个参数是为模型所创建集合的别名（Mongoose 将为 SomeModel 模型创建数据库集合），第二个参数是创建模型时使用的模式。
module.exports = mongoose.model('Author', AuthorSchema)