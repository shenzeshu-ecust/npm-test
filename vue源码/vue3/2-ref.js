let activeEffect = null;
function effect(fn) {
  activeEffect = fn;
  activeEffect(); // 触发了代理的get
  activeEffect = null;
}

// ref实现
function ref(initValue) {
  return reactive({
    value: initValue,
  });
}
// computed实现
function computed(fn) {
  const result = ref();
  effect(() => (result.value = fn())); // 执行computed传入函数
  return result;
}
