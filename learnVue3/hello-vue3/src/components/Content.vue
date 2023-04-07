<template>
  <div>
    <h2>content组件</h2>
    <button @click="send2Parent">发射数据</button>
    <h3 ref="root">获取父组件provide的数据为: {{ name }}</h3>
    <h3>获取父组件provide的响应式数据为: {{ reactiveName }}</h3>
  </div>
</template>
<script>
import { onUpdated, toRefs, ref, inject, watchEffect } from "vue";
export default {
  props: {
    message: {
      type: String,
      default: "您好",
    },
  },
  setup(props, context) {
    // 或者 setup(props, { expose, attrs, emit, slots}){}
    console.log("content的获得属性", props);
    console.log("setup中的context", context);
    console.log("setup中的context", context.attrs);
    console.log("setup中的context", context.attrs.class);
    const num = ref("12345678");
    function send2Parent() {
      context.emit("injectNum", num.value);
    }
    // 变成响应式
    const { message } = toRefs(props);
    onUpdated(() => {
      console.log("content中的", message);
    });
    context.expose({ send2Parent, num }); // 暴露出外界需要的属性、方法
    // 侦听模板引用
    const root = ref(null);
    const stop = watchEffect(
      () => {
        console.log(root.value); // <h3>获取父组件provide的数据为: 张三</h3>
      },
      {
        flush: "post", // 推迟到DOM更新后运行callback。如果没有这个，则显示null
      }
    );
    // 不再需要此侦听器时
    stop();
    /**
     * watchEffect和watch区别
     * 1 执行时机：watchEffect是立即执行的，在页面加载时会主动执行一次，来收集依赖；而watch是惰性地执行副作用，它不会立即执行，但可以配置 immediate，使其主动触发
     * 2 参数不同：watchEffect只需要传递一个回调函数，不需要传递侦听的数据，它会在页面加载时主动执行一次，来收集依赖；而watch至少要有两个参数（第三个参数是配置项），第一个参数是侦听的数据，第二个参数是回调函数
     * 3 结果不同：watchEffect获取不到更改前的值；而watch可以同时获取更改前和更改后的值
     *
     * 相同点：
     * watch 与 watchEffect 在手动停止侦听、清除副作用 (将 onInvalidate 作为第三个参数传递给回调)、刷新时机和调试方面有相同的行为。
     */
    // inject 接受数据
    const name = inject("name"); // 传的不是响应式的
    const reactiveName = inject("myname");
    return { send2Parent, name, reactiveName, root };
    // return ()=> h('h2', num.value) // 如果return这一句，只会出现<h2>12345678</h2>,其他模板中的元素都没了。这时候想要
    // 还是能让组件暴露出一些属性方法，就需要context.expose({})
  },
};
</script>
