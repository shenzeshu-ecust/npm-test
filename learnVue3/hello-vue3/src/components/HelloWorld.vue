<script setup>
// 顶层的绑定会暴露给模板
// 里面的代码会被编译成组件 setup() 函数的内容。
// 这意味着与普通的 <script> 只在组件被首次引入的时候执行一次不同，
// <script setup> 中的代码会在  每次组件实例被创建的时候  执行
import { ref } from "vue";
// 语法糖setup的script文件引入组件不需要注册
import Com1 from "./Com1.vue";
// 定义变量、函数，在模板中 不需要暴露出去， 模板直接使用
const a = 20;
console.log(20);
defineProps({
  msg: String,
});
const divRef = ref(null);
const emit = defineEmits(["getText"]);
// 发射由点击事件触发
const get = () => {
  emit("getText", 1111);
};
// 定义响应式变量
const count = ref(0);
// 使用 <script setup> 的组件是默认关闭的，
// 也即通过模板 ref 或者 $parent 链获取到的组件的公开实例，不会暴露任何在 <script setup> 中声明的绑定（比如a, count ，通过ref获取是undefined）。
defineExpose({
  a,
  count,
  get,
}); // 明确要暴露出去的属性。
</script>
<script>
// <script setup> 可以和普通的 <script> 一起使用。普通的 <script> 在有这些需要的情况下或许会被使用到：

//     1 无法在 <script setup> 声明的选项，例如 inheritAttrs 或通过插件启用的自定义的选项。
export default {
  inheritAttrs: false,
  customOptions: {},
};
//     2 声明命名导出。
//     3 运行副作用或者创建只需要执行一次的对象。
</script>
<template>
  <Com1 />
  <h2>{{ a }}</h2>
  <h1>{{ msg }}</h1>
  <div ref="divRef" style="background: cadetblue" @click="get">我是你爹</div>
  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
