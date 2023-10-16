// ! 1 工厂模式: 更方便地去创建实例
// 比如axios中经常用到的axios.create
// ~ * axios.create() **每次返回的都是一个全新的实例~
class Axios {}

class A {
  create() {
    return new Axios();
  }
}

const axios = new A();

export default axios;

// 使用部分
import axios from "axios";
// 创建很多实例
const httpRequest1 = axios.create();
const httpRequest2 = axios.create();

// ! 2 单例模式
// 定义一个类，生成一个实例，并且整个项目仅此这一个实例

// 封装使用Axios时，我们会先定义封装一个请求的实例然后暴露出去
// utils/request.ts

// 定义一个类
class HttpRequest {
  instance: AxiosInstance;
  constructor(options: CreateAxiosOptions) {
    this.instance = axios.create(options);
  }

  setHeader() {}
  get() {}
  post() {}
  put() {}
  delete() {}
}
// 生成一个实例
const request = new HttpRequest({});

// 全局仅用这么一个请求实例
export default request;

// 然后在项目中各处去使用这一个请求实例
import request '@/utils/request'

const fetchData = (url) => {
  return request.get(url)
}

// ! 3 策略模式
// * 根据不同的策略去做不同的事情
const doMap = {
  10: () => { console.log('isBoy')},
  12: () => { console.log('isGirl')
  }
}
const doSomething = (age: number) => {
  doMap[age]?.()
}
