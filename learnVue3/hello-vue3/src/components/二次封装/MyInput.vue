<script setup>
import { ElInput } from "element-plus";
import {
  useAttrs,
  useSlots,
  onMounted,
  onBeforeMount,
  ref,
  getCurrentInstance,
  defineExpose,
} from "vue";
// 在你的确需要使用它们的罕见场景中，可以分别用 useSlots 和 useAttrs 两个辅助函数：
const attrs = useAttrs();
const slots = useSlots();

const inp = ref(null);
onBeforeMount(() => {
  // 在 <script setup> 使用 slots 和 attrs 的情况应该是相对来说较为罕见的，因为可以在模板中直接通过 $slots 和 $attrs 来访问它们。
  console.log(attrs);
  /* 结果：
   * modelValue: ""
   * onUpdate:modelValue: $event => (($setup.inputText) = $event)
   */
  console.log(slots);
  /*  结果
   * append: (...args) => {…}
   * prefix: (...args) => {…}
   */

  console.log(inp.value);
});

// **** setup中通过getCurrentInstance获取实例 ****
const instance = getCurrentInstance();

onMounted(() => {
  console.log(this); // undefined 因为setup里没有this

  const entries = Object.entries(inp.value);
  // 都把el-input自身的属性方法绑定到组件的实力
  for (const [key, value] of entries) {
    instance[key] = value;
  }

  console.log(instance);
});
// 由于setup的脚本默认封闭特性，只有使用defineExpose才能向外暴露实例

defineExpose({ instance });
</script>
<template>
  <div class="my-input">
    <!-- $attrs 传所有的el-input属性给组件（否则一个个属性传很麻烦） -->
    <el-input ref="inp" v-bind="$attrs">
      <!-- 插槽错误做法: 一个个写(如果父组件有些插槽没传 可能会有错误) -->

      <!-- <template #prefix>
        <slot name="prefix"></slot>
      </template> -->

      <!-- 正确做法：(这里的name就是插槽$slots的key，也就是名字) -->
      <!-- #[name]="slotProps" 或者写成 v-slot:[name]="slotProps" -->
      <!-- #[name]="slotProps" 或者v-slot="slotProps" 这种叫作用域插槽 -->
      <template v-for="(value, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}"></slot>
      </template>
    </el-input>
  </div>
</template>
<style scoped></style>
