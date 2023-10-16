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
// ! 1 创建实例： axios为啥可以使用axios({ }) 和 axios.get()两种方式发送请求
/**
 * @param {Object} defaultConfig 默认配置
 * @return {Axios} 一个 axios 的实例对象
 */
function createInstance(defaultConfig) {
  // 基于默认配置创建一个Axios实例上下文。
  var context = new Axios(defaultConfig);

  // bind方法返回一个函数，执行这个函数，相当于执行 Axios.prototype.request，方法中的 this 指向 context，
  // 这就是我们引入 axios 后可以直接通过 axios({...}) 发送请求的原因，
  var instance = bind(Axios.prototype.request, context);

  // 将 axios 的原型对象 Axios.prototype 上的属性依次赋值给这个实例对象
  // 这样操作后我们就可以通过 axios.get()发送请求，实际上调用原型对象上的方法
  utils.extend(instance, Axios.prototype, context);

  // 将 axios 实例的私有属性赋值给当前的 instance
  // 这样我们可以获取到实例上的属性，例如 通过 axios.defaultConfig 获取默认配置
  utils.extend(instance, context);
  return instance;
}

// 创建一个 axios 实例，实际上就是上述函数中的 instance；
var axios = createInstance(defaults);

module.exports.default = axios;

/*
 创建 axios 实例，也是我们通过 import axios from 'axios' 时的 axios 对象，这个对象实际上是 Axios 类的原型上的 request 方法，
  方法中的 this 指向 一个新的基于默认配置创建的 axios 实例。

  * 暴露的axios上挂载了基于默认配置创建的Axios实例属性，也挂载了原型上的方法。
  * 这里就解答了一个问题，使用 axios(config) 发送请求调用的是 Axios.prototype.request 方法，
  * 使用 axios.get(url[, config] )方法发送请求，调用的是 Axios.prototype.get 方法。


 */

// ! 2 Axios构造函数
/**
 * Create a new instance of Axios
 * @param {Object} instanceConfig 默认配置
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager(),
  };
}

Axios.prototype.request = function request() {};

// ! 3 发送请求的 request 方法
// ~ 这个方法做了两件事

// ~ 1. 获取发送 HTTP 请求的参数
// ? 2.编排请求的 Promise 链,并执行该 Promise链

/**
 * 可以看到，axios 上挂载了 axios 类的一个实例，这个实例有一个interceptors 属性，属性值是一个对象，包含request 和 response 两个属性，
 * 分别是用来注册和管理 请求拦截器和相应拦截器。我们来看一下是如何进行管理的
 *
 */
// 拦截器的构造函数
function InterceptorManager() {
  this.handlers = [];
}

// 注册拦截器函数，注意:这里拦截器可以注册多个, 按照注册的先后顺序排列
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({ fulfilled: fulfilled, rejected: rejected });
  return this.handlers.length - 1;
};
// 用于移除拦截器
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

// ~ 注意，后注册的请求拦截器会先执行，响应拦截器是按照注册顺序执行的。

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

// ? 如何使用拦截器
// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  return config;
});
// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  return response;
});

// ! 4 Axios 如何防御 CSRF 攻击
// lib/adapters/xhr.js
module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestHeaders = config.headers;
    var request = new XMLHttpRequest();
    // 添加xsrf头部
    if (utils.isStandardBrowserEnv()) {
      var xsrfValue =
        (config.withCredentials || isURLSameOrigin(fullPath)) &&
        config.xsrfCookieName
          ? cookies.read(config.xsrfCookieName)
          : undefined;
      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }
    request.send(requestData);
  });
};
// 利用csrf token防止攻击
// * 看完以上代码，我们知道了 Axios 是将 token 设置在 Cookie 中，在提交（POST、PUT、PATCH、DELETE）等请求时提交 Cookie，并通过请求头或请求体带上 Cookie 中已设置的 token，服务端接收到请求后，再进行对比校验。

// Axios 提供了 xsrfCookieName 和 xsrfHeaderName 两个属性来分别设置 CSRF 的 Cookie 名称和 HTTP 请求头的名称，它们的默认值如下所示：

// lib/defaults.js
var defaults = {
  adapter: getDefaultAdapter(),
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
};
