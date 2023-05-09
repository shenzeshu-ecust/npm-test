<script>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from "./components/HelloWorld.vue";
import Content from "./components/Content.vue";
import MyInput from "./components/二次封装/MyInput.vue";

import { Search } from "@element-plus/icons-vue";
import {
  ref,
  reactive,
  toRefs,
  watch,
  watchEffect,
  computed,
  onBeforeMount,
  onMounted,
  onUpdated,
  onBeforeUpdate,
  provide,
} from "vue";
export default {
  // setup在beforeCreate之前，所以不能访问到data、computed、methods和refs
  // 只能访问以下property： props,attrs,slots,emits
  setup() {
    // ! 通过ref定义响应式变量
    const count = ref(0);
    function changeCount() {
      // 用.value访问
      count.value++;
    }
    const msg = ref("hello-Vue3");
    function changeMsg() {
      msg.value = "hello-Vite";
    }
    const reverseMsg = computed(() => {
      return msg.value.split("").reverse().join("");
    });
    // reverseMsg 还一个对象，要用value取值
    console.log(reverseMsg);
    console.log("🚀 ", reverseMsg.value);

    // 通过reactive定义响应式对象
    const person = reactive({
      name: "shenzeshu",
      age: 27,
      child: {
        name: "dog",
        age: 12,
        reverseMsg: computed(() => {
          return msg.value.split("").reverse().join("");
        }),
      },
    });
    function changePerson() {
      person.name = "dongleifei";
      person.age = 28;
    }
    watch(count, (newVal, oldVal) => {
      console.log("🚀 ~ file: App.vue ~ line 29 ~ watch ~ oldVal", oldVal);
      console.log("🚀 ~ file: App.vue ~ line 29 ~ watch ~ newVal", newVal);
    });
    // 无法监听对象
    watch(person, (newVal, oldVal) => {
      console.log("🚀 ~ file: App.vue ~ line 32 ~ watch ~ oldVal", oldVal); // 'dongleifei'
      console.log("🚀 ~ file: App.vue ~ line 32 ~ watch ~ newVal", newVal); // 'dongleifei' 一样
    });
    // watchEffect(cb) 不需要指定监听的属性，自动收集依赖； 且初始化时会执行一次 callback
    watchEffect(() => {
      console.log(person.name);
    });

    onBeforeMount(() => {
      console.log("OnBeforeMount");
    });
    //         provide --- inject 跨组件通信 ///////
    provide("name", "张三"); // 父组件传值(非响应式)(Content组件接收)

    // 使用ref或者Reactive使得数据响应式。reactive针对对象
    const myname = ref("李四");
    provide("myname", myname); // 不要传myname.value  会失去响应式
    function changeMyName() {
      myname.value = "王五";
    }
    // 加入通过ES6的扩展运算符...进行解构会使得对象的属性不是 响应式的！
    // ! toRefs(obj) 使得结构后的属性重新获得响应式 const {name, child} = toRefs(person）

    const inputText = ref("");

    return {
      count,
      changeCount,
      msg,
      changeMsg,
      reverseMsg,
      person,
      inputText,

      ...toRefs(person),
      changePerson,
      changeMyName,
    };
  },
  methods: {
    injectNum(num) {
      console.log(num);
    },
    getText(val) {
      console.log("HelloWorld中emit的数据为", val);
    },
  },
  mounted() {
    console.log("获取expose出的内容", this.$refs.content.num);
    console.log("获取HelloeWorldexpose出的内容", this.$refs.helloworld);

    console.log("input:", this.$refs);
    this.$refs.input.instance.focus();
  },

  components: {
    Content,
    HelloWorld,
    MyInput,
  },
};
</script>

<template>
  <div>
    <!-- 从 setup 返回的 refs 在模板中访问时是被自动浅解包的 -->
    <p>{{ count }}</p>
    <button :style="{ background: '#ccc' }" @click="changeCount">+1</button>
    <p>{{ person.name }}:{{ person.age }}</p>
    <button :style="{ background: '#ccc' }" @click="changePerson">换人</button>
    <p>{{ child.name }}:{{ child.age }}</p>
    <h3>{{ msg }}</h3>
    <button :style="{ background: '#ccc' }" @click="changeMsg">
      changeMsg
    </button>
    <h3>{{ reverseMsg }}</h3>
    <Content
      ref="content"
      :message="person.name"
      class="hahaha"
      id="hehehehe"
      @injectNum="injectNum"
    />
    <button @click="changeMyName">改名咯</button>
  </div>
  <HelloWorld msg="Vite + Vue" ref="helloworld" @getText="getText" />

  <!-- 
    * 二次封装elementPlus组件
    ? 问题1：无法输入字符（因为没双向绑定），而且如果传原生el-input的属性，要一个个传，很麻烦，不合理
    ? 问题2：插槽（具名插槽等），如果组件自身一个个写，有些用不到
    ? 问题3：ref绑定在父组件上想要将其传递给el-input 从而直接拿到子组件中el-input的值、属性、方法无法做到（比如想要调用el-input上的focus方法）
  
  
  -->
  <MyInput ref="input" v-model="inputText" placeholder="地址">
    <template #prefix>
      <el-select placeholder="Select" style="width: 115px">
        <el-option label="Restaurant" value="1"></el-option>
        <el-option label="Order No." value="2"></el-option>
        <el-option label="Tel" value="3"></el-option>
      </el-select>
    </template>
    <template #append>
      <el-button>搜索</el-button>
    </template>
  </MyInput>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
