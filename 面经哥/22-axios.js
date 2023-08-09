axios.spread = function spread(fn) {
  return function (arr) {
    return fn.apply(null, arr);
  };
};

const fnn = (a, b) => {
  console.log("~~", a + b);
};
const fnn2 = spread(fnn);

console.log(fnn2([1, 2])); // 3

// 拦截器经典代码
// ~ 任务编排：Axios拦截器的思想是通过对数组中成员进行一定的排列，然后遍历执行，以达到一定的执行顺序。
// ~ 请求拦截器-请求-响应拦截器   构成promise链
function generateChain() {
  let chain = [dispatchRequest, undefined];
  // 使得每个 拦截器和请求都可以用config配置信息
  let promise = Promise.resolve(config);
  this.interceptors.request.forEach((interceptor) => {
    // 把设置的请求拦截器的成功处理函数、失败处理函数放到数组最前面
    //   ~ 所以请求拦截器从里向外执行
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });
  this.interceptors.response.forEach((interceptor) => {
    // 把设置的响应拦截器的成功处理函数、失败处理函数放到数组最后面
    //   ~ 响应拦截  依次执行
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }
  return promise;
}

// 新版
// dispatchRequest是api请求
var chain = [dispatchRequest, undefined];
// 把请求拦截器数组requestInterceptorChain 放在 chain 数组的前面
Array.prototype.unshift.apply(chain, requestInterceptorChain);

// 把响应拦截器responseInterceptorChain 放在chain数组的后面
chain = chain.concat(responseInterceptorChain);

promise = Promise.resolve(config);
// 遍历执行chain函数
while (chain.length) {
  promise = promise.then(chain.shift(), chain.shift());
}

/**
 * 链式调用骨架这里在6个月前一个新的pr，重构了这部分的代码逻辑，这个pr内容很大，你忍一下：
    这里主要是针对了请求拦截器可能会出现异步情况、或有很长的宏任务执行，并且重构之前的代码中，
    因为请求事放到微任务中执行的，微任务创建的时机在构建promise链之前，
    如果当执行到请求之前宏任务耗时比较久，或者某个请求拦截器有做异步，
    会导致真正的ajax请求发送时机会有一定的延迟，所以解决这个问题是很有必要的。


 */

// 请求拦截器储存数组
var requestInterceptorChain = [];
// 默认所有请求拦截器都为同步
var synchronousRequestInterceptors = true;
// 遍历注册好的请求拦截器数组
this.interceptors.request.forEach(function unshiftRequestInterceptors(
  interceptor
) {
  // 这里interceptor是注册的每一个拦截器对象 axios请求拦截器向外暴露了runWhen配置来针对一些需要运行时检测来执行的拦截器
  // 如果配置了该函数，并且返回结果为true，则记录到拦截器链中，反之则直接结束该层循环
  if (
    typeof interceptor.runWhen === "function" &&
    interceptor.runWhen(config) === false
  ) {
    return;
  }
  // interceptor.synchronous 是对外提供的配置，可标识该拦截器是异步还是同步 默认为false(异步)
  // 这里是来同步整个执行链的执行方式的，如果有一个请求拦截器为异步 那么下面的promise执行链则会有不同的执行方式
  synchronousRequestInterceptors =
    synchronousRequestInterceptors && interceptor.synchronous;
  // 塞到请求拦截器数组中
  requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
});
// 相应拦截器存储数组
var responseInterceptorChain = [];
// 遍历按序push到拦截器存储数组中
this.interceptors.response.forEach(function pushResponseInterceptors(
  interceptor
) {
  responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
});

var promise;
// 如果为异步 其实也是默认情况
if (!synchronousRequestInterceptors) {
  // 这里和重构之前的逻辑是一致的了
  var chain = [dispatchRequest, undefined];
  // 请求拦截器塞到前面
  Array.prototype.unshift.apply(chain, requestInterceptorChain);
  // 响应拦截器塞到后面
  chain = chain.concat(responseInterceptorChain);
  promise = Promise.resolve(config);
  // 循环 执行
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }
  // 返回promise
  return promise;
}

// 这里则是同步的逻辑
var newConfig = config;
// 请求拦截器一个一个的走 返回 请求前最新的config
while (requestInterceptorChain.length) {
  var onFulfilled = requestInterceptorChain.shift();
  var onRejected = requestInterceptorChain.shift();
  // 做异常捕获 有错直接抛出
  try {
    newConfig = onFulfilled(newConfig);
  } catch (error) {
    onRejected(error);
    break;
  }
}
// 到这里 微任务不会过早的创建 也就解决了 微任务过早创建、当前宏任务过长或某个请求拦截器中有异步任务而阻塞真正的请求延时发起问题
try {
  promise = dispatchRequest(newConfig);
} catch (error) {
  return Promise.reject(error);
}
// 响应拦截器执行
while (responseInterceptorChain.length) {
  promise = promise.then(
    responseInterceptorChain.shift(),
    responseInterceptorChain.shift()
  );
}

return promise;
